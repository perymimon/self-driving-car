import Sensor from "./sensor.js";
import {
    getNearestSegment,
    subtract,
    angle,
    radToDeg,
    angle2P,
    angle2PScreen
} from "../utils/algebra-math-utils.js";
import {simpleAngle} from "../utils/math-utils.js";
import Segment from "../primitives/segment.js";

export default class SensorCompass {

    constructor(car) {
        this.car = car
        this.nearSeg = null
        this.sensorsCount = 1
    }
    toJSON(){
        return {}
    }
    fromJSON(car, json) {
        return new SensorCompass(car)
    }
    update(segments){
        if(!segments || segments.length === 0) return 0
        this.nearSeg = getNearestSegment(this.car,segments)
        let targetPoint = this.nearSeg.p2
        let alpha = angle2PScreen(this.car, targetPoint)  /*0ang is up*/
        let delta = simpleAngle(alpha - this.car.angle)
        this.normDeleta = delta / Math.PI
    }

    get readings(){
        return { offset: this.normDeleta }
    }

    draw(ctx){
        if(!this.nearSeg) return
        let seg = new Segment(this.car, this.nearSeg.p2)
        seg.draw(ctx, {color:'hwb(60deg 10% 56%)', dash:[2,2]})
    }
}