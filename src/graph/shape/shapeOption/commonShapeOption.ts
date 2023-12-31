import { MoveModel } from "../../models/MoveModel";
import { Shape, ShapeKey, SubShapeType } from "../../types";
import { ShapeOption, ShapeType } from "../../types/shapeOption";
import { ArrowType, SiderbarItemKey } from "../constant";

export const baseShapeOption: ShapeOption = {

    shapeType: ShapeType.Symbol,
    subShapeType: SubShapeType.Block,
    shapeKey: ShapeKey.Block,
    style: {
        background: 'linear-gradient(to right,#DDCD9E,#FDF7DF)',
        strokeColor: "#ad9d85",
        //   strokeWidth: 1,
        //   selectable: true,
        //   movable: true,
        //   resizable: true,
        //   editable: true,
        //   showConstraintsValues: false
        // paddingTop: 0,
        // paddingLeft: 0,
        // paddingRight: 0,
        // paddingBottom: 0
    },
    keywordsBounds: {
        absX: 0, absY: 0, width: 0, height: 0, x: 0, y: 0
    },
    keywordsStyle: {
        fontWeight: 400, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: '', color: 'rgb(0,0,0)', textAlign: 'center'
    },

    showIcon: false,
    icon: '', // 图的图标

    showName: true,
    nameStyle: {
        fontWeight: 400, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: '', color: 'rgb(0,0,0)',
        textAlign: 'center'
    },
    taggedValuesStyle: {
        fontWeight: 400, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: '', color: 'rgb(0,0,0)',
        textAlign: 'left', wordBreak: 'break-all'
    },
    constraintsValuesStyle: {
        fontWeight: 400, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: '', color: 'rgb(0,0,0)',
        textAlign: 'center', wordBreak: 'break-all'
    },
    nameBounds: {
        absX: 0, absY: 0, width: 100, height: 13, x: 0, y: 0
    },
    taggedValuesBounds: {
        absX: 0, absY: 0, width: 100, height: 13, x: 0, y: 0
    },
    constraintsValuesBounds: {
        absX: 0, absY: 0, width: 100, height: 13, x: 0, y: 0
    },
    bounds: { absX: 0, absY: 0, width: 100, height: 80, x: 0, y: 0 },
    /**
     * 移动结束时触发的方法
     * @param moveModel
     * @param dx
     * @param dy
     */
    async customEndMove(moveModel: MoveModel, dx: number, dy: number) {
        // 更新模型位置
        moveModel.movingShapes.forEach(shape => {
            shape.bounds.x += dx;
            shape.bounds.y += dy;
            shape.bounds.absX += dx;
            shape.bounds.absY += dy;
        })
    }
};


export const edgeOption: ShapeOption = {
    ...baseShapeOption,
    shapeType: ShapeType.Edge,
    subShapeType: SubShapeType.CommonEdge,
    shapeKey: ShapeKey.Association,
    waypoint: [],
    bounds: { absX: 0, absY: 0, width: 100, height: 2, x: 0, y: 0 },
    style: {
        ...baseShapeOption.style,
        showConstraintsValues: false,
        dashed: false,
        rounded: false,
        rightAngle: true,
        imageBox: false,
        strokeColor: 'rgb(0,0,0)',
        fillColor: 'rgb(255,255,255)',
        strokeWidth: 1,
        sourceArrow: undefined,
        // midArrow: undefined,
        targetMidArrow: undefined,
        sourceMidArrow: undefined,
        targetArrow: undefined,
        hidden: false,
        selectable: true,
        movable: true,
        resizable: false,
        // showKeywords: false,
        editable: false
    }

};


export const blockOption: ShapeOption = {
    ...baseShapeOption,
    shapeType: ShapeType.Symbol,
    subShapeType: SubShapeType.Block,
    shapeKey: ShapeKey.Block,
    style: {
        ...baseShapeOption.style,
        background: 'linear-gradient(to right,#DDCD9E,#FDF7DF)',
        strokeColor: "#ad9d85",
        strokeWidth: 1,
        resizable: true
    },
    bounds: { absX: 10, absY: 10, width: 100, height: 50, x: 10, y: 10 },
    nameStyle: { fontWeight: 400, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: '', textAlign: 'center' },

};
export const modelKeyConfig = {
    [SiderbarItemKey.Block]: {
        shapeOption: {
            ...blockOption,
            shapeKey: ShapeKey.Block
        }
    },
    [SiderbarItemKey.ItemFlow]: {
        shapeOption: {
            ...edgeOption,
            shapeKey: ShapeKey.ItemFlow,
            showKeywords: true,
            style: {
                ...edgeOption.style,
                dashed: true,
                targetArrow: ArrowType.Arrow
            }
        }
    }
}