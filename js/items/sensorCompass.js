import Sensor from "./sensor.js";
import {getNearestSegment, subtract,angle} from "../utils/algebra-math-utils.js";
import {normAngle} from "../utils/math-utils.js";
import Segment from "../primitives/segment.js";

export default class SensorCompass {

    constructor(car) {
        this.car = car
        this.nearSeg = null
        this.sensorsCount = 1
    }

    update(segments){
        if(!segments || segments.length === 0) return 0
        this.nearSeg = getNearestSegment(this.car,segments)
        let targetPoint = this.nearSeg.p2
        let a = angle(subtract(targetPoint, this.car)) - Math.PI /*0ang is up*/
        let carA = normAngle(this.car.angle)
        let delta = (a - carA)
        this.normDeleta ={ offset: delta/ 180}
    }

    readings(){
        return this.normDeleta
    }

    draw(ctx){
        if(!this.nearSeg) return
        let seg = new Segment(this.car, this.nearSeg.p2)
        seg.draw(ctx, {color:'hwb(60deg 10% 56%)', dash:[2,2]})
    }
}