import { Shape } from "../../types";
import { Point } from "../../util/Point";
import { shapeUtil } from "../ShapeUtil";
import { SiderbarItemKey } from "../constant";
import { SiderBarDropBehavior } from "./SiderbarDropBehavior";
import { behaviorConfigs } from "./config";


import { pinia, useDrawStore } from '../../../editor/store/index'
export class SiderBarDropRunner {
    public shape: Shape
    createdShapes: Set<Shape> = new Set()
    constructor() {

    }
    async init() {
        const shapeMap = new Map()
        // this.shape = shapeMap.get(this.shapeId)
    }
    async run( siderBarKey: SiderbarItemKey,  point?: Point) {
        const store = useDrawStore()

        await this.init()
        const behaviors = this.getMatchedBehaviors(siderBarKey, point);
        for (let behavior of behaviors) {
            const result = await behavior.run();
            if (result === 'stop') break; // 可能执行到一半后需不要继续执行了，（例如需要用户二次确认）
            behavior.createdShapes.forEach(shape => {
                this.createdShapes.add(shape)
            })
        }
        store.addShapes(this.createdShapes)
        const createdShapes = [...this.createdShapes];
        this.createdShapes = new Set()
        return createdShapes
    }
    getMatchedBehaviors(siderBarKey: SiderbarItemKey,  point?: Point) {
        const behaviors: SiderBarDropBehavior[] = [];
        behaviorConfigs.forEach(config => {
            if (config.siderbarItemKeys.includes(siderBarKey)) {
                const Behavior = config.behavior
                behaviors.push(new Behavior(this, siderBarKey,  point))
            }
        })
        return behaviors
    }
}