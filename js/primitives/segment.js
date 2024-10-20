import {add, average, distance, dot, getIntersection, magnitude, normalize, scale, subtract} from "../utils/algebra-math-utils.js";
import Point from "./point.js";
export default class Segment {
    static counter = 0
    #radius = 0
    #center = null

    constructor(p1, p2, oneWay = true, shape = 'line') {
        this.p1 = p1;
        this.p2 = p2;
        this.shape = shape
        this.oneWay = oneWay
        this.id = Segment.counter++
        // todo: make arc shape. and make intersection for it
    }

    static load(info) {
        let seg = new Segment(
            Point.load(info.p1),
            Point.load(info.p2)
        )
        this.oneWay = info.oneWay
        seg.shape = info.shape
        seg.id = info.id
        return seg
    }

    draw(ctx, {width = 2, color = "black", dash = null, cap = "butt"} = {}) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.lineCap = cap;
        if (dash)
            ctx.setLineDash(dash)
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke()
        ctx.setLineDash([])

    }

    get centeroid() {
        if (this.#center) return this.#center
        return this.#center = average(this.p1, this.p2)
    }

    get radius() {
        if (this.#radius) return this.#radius
        return this.#radius = this.length() / 2
    }

    equal(seg) {
        let {p1, p2} = this;
        return (p1.equal(seg.p1) && p2.equal(seg.p2))
            || (p1.equal(seg.p2) && p2.equal(seg.p1));

    }

    includes(point) {
        return this.p1.equal(point) || this.p2.equal(point);
    }

    length() {
        return distance(this.p1, this.p2)
    }

    replacePoint(oldP, newP) {
        if (oldP.equal(this.p1)) this.p1 = newP
        else if (oldP.equal(this.p2)) this.p2 = newP
        else return false
        return true
    }

    directionVector() {
        return normalize(subtract(this.p2, this.p1))
    }

    distanceToPoint(point) {
        const proj = this.projectPoint(point);
        if (proj.offset > 0 && proj.offset < 1) {
            return distance(point, proj.point);
        }
        const distToP1 = distance(point, this.p1);
        const distToP2 = distance(point, this.p2);
        return Math.min(distToP1, distToP2);
    }

    projectPoint(point) {
        const a = subtract(point, this.p1);
        const b = subtract(this.p2, this.p1);
        const normB = normalize(b);
        const scaler = dot(a, normB);
        const proj = {
            point: add(this.p1, scale(normB, scaler)),
            offset: scaler / magnitude(b),
        };
        return proj;
    }

    intersection(seg) {
        if (distance(seg.centeroid, this.centeroid) > seg.radius + this.radius) return null
        return getIntersection(this, seg)
    }
}