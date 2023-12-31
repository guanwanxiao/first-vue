import { cloneDeep } from "lodash";
import { EdgeMoveType, EventType, MarkerColor } from "../shape/constant";
import { Shape, SubShapeType } from "../types";
import { ShapeType } from "../types/shapeOption";
import { Point } from "../util/Point";
import { int } from "../util/WaypointUtil";
import { GraphModel } from "./graphModel";
import { useDrawStore } from "../../editor/store";
import { Marker } from "./Marker";

export class EdgePointMoveModel {
    movingShape: Shape | undefined = undefined;
    startPoint = new Point() // 移动起始时的鼠标的坐标
    endPoint = new Point() // 移动过程中鼠标的坐标
    dx = 0 // 移动的x距离
    dy = 0 // 移动的y距离
    showPreview = false // 是否显示预览
    previewwaypoint: Point[] = [] // 预览线的路径点
    movingOriginWayPoint: Point[] = [] // 原始waypoint线路
    previewPath = '' // 预览线的路径path的d属性
    movePointIndex = -1 // 移动的点是第几个点 从0开始
    moveType: EdgeMoveType | undefined = undefined // 移动类型
    // marker?: Marker
    sourceShape?: Shape
    targetShape?: Shape
    moved = false
    marker?: Marker
    store = useDrawStore()
    constructor(public graph: GraphModel) {

    }

    get isSourcePoint() {
        return this.moveType === EdgeMoveType.SourcePoint;
    }
    get isTargetPoint() {
        return this.moveType === EdgeMoveType.TargetPoint;
    }

    // 鼠标按下线段的转折点时触发（即按下selectionVertex）
    onEdgePointMouseDown(event: MouseEvent, shape: Shape, index: number) {

        if (shape.shapeType !== ShapeType.Edge) return;
        this.startMoveEdgePoint(event, shape, index);
    }
    startMoveEdgePoint(event: MouseEvent, shape: Shape, index: number) {
        this.movingShape = shape;
        this.movingOriginWayPoint = shape.waypoint.map((n) => { return new Point(n.x, n.y); });
        this.movePointIndex = index;

        if (index === 0) {
            this.moveType = EdgeMoveType.SourcePoint;
        } else if (index === this.movingShape.waypoint.length - 1) {
            this.moveType = EdgeMoveType.TargetPoint;
        } else {
            this.moveType = EdgeMoveType.Waypoint;
        }

        const points = this.movingShape.waypoint;
        this.previewwaypoint = points.map(p => ({ ...p }));

        this.startPoint.x = event.clientX;
        this.startPoint.y = event.clientY;
        this.endPoint.x = event.clientX;
        this.endPoint.y = event.clientY;
        this.dx = 0;
        this.dy = 0;
        this.showPreview = true;

        const onMouseMove = this.onMouseMove.bind(this);
        const onMouseUp = () => {
            this.graph.emitter.off(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
            this.graph.emitter.off(EventType.SHAPE_MOUSE_UP, onMouseUp);
            window.removeEventListener('mouseup', onMouseUp); // 如果移动到了画布或窗口之外

            this.endMove();
        };
        this.graph.emitter.on(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
        this.graph.emitter.on(EventType.SHAPE_MOUSE_UP, onMouseUp);
        window.addEventListener('mouseup', onMouseUp);
    }
    initPreviewState() {
        this.showPreview = false;
        this.startPoint = new Point();
        this.endPoint = new Point();
        this.dx = 0;
        this.dy = 0;
        this.previewwaypoint = [];
        this.previewPath = '';
        this.sourceShape = undefined;
        this.targetShape = undefined;
        this.movePointIndex = -1;
        this.moved = false;
        this.showPreview = false;
        this.movingShape = undefined
        this.removeMarker();
    }
    async onMouseMove(event: MouseEvent, shape?: Shape) {
        this.endPoint.x = event.clientX;
        this.endPoint.y = event.clientY;
        this.moved = true;
        this.dx = this.endPoint.x - this.startPoint.x;
        this.dy = this.endPoint.y - this.startPoint.y;
        // 获取当前鼠标点在画布上的坐标
        const curPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY), this.graph.viewModel.viewDom as HTMLDivElement);
        const edgeShape = this.movingShape;
        const newEdgeShape = cloneDeep(edgeShape)
        /**
         * 当前悬浮的元素, 过滤掉悬浮在线元素上的图形
         * 如果已经绘制过则跳过
         */
        if (shape && shape.subShapeType !== SubShapeType.CommonEdge && shape.id !== this.movingShape.id) {
            this.connectShape(shape) // mousemove 移动到对应图形上，会 emit move 事件出来，此时监听到进入某个图形，进行图形之间关系绑定
        } else if (!shape) {
            // 移动时未连接图形，则情况 marker
            this.removeMarker()
        }
        // TODO 目前只考虑两个点的情况，后续考虑折线
        if (this.isTargetPoint) {
            const lastPoint = newEdgeShape.waypoint[1]
            lastPoint.x = lastPoint.x + this.dx
            lastPoint.y = lastPoint.y + this.dy
            this.store.updateShape(edgeShape.id, newEdgeShape)
        } else if (this.isSourcePoint) {
            const firstPoint = newEdgeShape.waypoint[0]
            firstPoint.x = firstPoint.x + this.dx
            firstPoint.y = firstPoint.y + this.dy
            this.store.updateShape(edgeShape.id, newEdgeShape)
        }
        this.previewwaypoint = newEdgeShape.waypoint

        this.updatePreviewPath();
    }
    endMove() {
        if (!this.movingShape) {
            console.error('缺失 movingShape');
            this.initPreviewState();

            return;
        }
        const shapeMap = {
            [EdgeMoveType.TargetPoint]: this.targetShape,
            [EdgeMoveType.SourcePoint]: this.sourceShape
        };
        // 更新，vertex 渲染最新控制点
        this.movingShape.waypoint = this.previewwaypoint
        const id = shapeMap[this.moveType]?.id // 建立关联关系
        if (id) { }
        this.initPreviewState()
    }
    updatePreviewPath() {
        let points = this.previewwaypoint;
        if (!this.moved) {
            points = this.movingShape?.waypoint || [];
        }
        if (!points?.length) {
            this.previewPath = '';
            return;
        }

        let path = `M ${int(points[0].x)} ${int(points[0].y)}`;
        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            path += (' L ' + int(p.x) + ' ' + int(p.y));
        }
        this.previewPath = path;
    }
    connectShape(shape: Shape) {
        // 创建 marker
        if (!this.marker) {
            this.marker = new Marker(shape, 'blue', 2);
            this.graph.markerModel.addMarker(this.marker);
        }
        this.marker.setTargetShape(shape);
        this.marker.setVisible(true);
        this.marker.setStrokeColor(MarkerColor.valid);
    }
    removeMarker() {
        if (this.marker) {
            // 清除 markerModel 管理器中对应的 marker
            this.graph.markerModel.removeMarker(this.marker.id);
            this.marker = undefined;
        }
    }
}