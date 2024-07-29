import Segment from "./segment.js";
import {average, getIntersection} from "../math/utils.js"
import Point from "./point.js";
import {getRandomColor, style} from "../cavas-utils.js";

export default class Polygon {
    constructor(points) {
        this.points = points;
        this.segments = []
        for (var i = 1; i < points.length; i++)
            this.segments.push(new Segment(points[i - 1], points[i]));
        this.segments.push(new Segment(points[i - 1], points[0]));
    }
    containsSegment(seg){
        const midPoint = average(seg.p1, seg.p2)
        return this.containsPoint(midPoint, seg.p2)
    }
    containsPoint(point) {
        const outerPoint = new Point(-10000, -10000)
        const crossSegment = new Segment(outerPoint, point)
        let intersectionCount = 0;
        for (const seg of this.segments) {
            const int = getIntersection( crossSegment, seg)
            if(int) intersectionCount++
        }
        return intersectionCount % 2 == 1
    }
    static union(polys) {
        Polygon.multiBreak(polys)
        const keptSegments = []
        for (let i = 0; i < polys.length; i++) {
            for (let seg of polys[i].segments) {
                let keep = true
                for (let j = 0; j < polys.length; j++) {
                    if (i == j) continue
                    if(polys[j].containsSegment(seg)) {
                        keep = false
                        break
                    }
                }
                if(keep)
                    keptSegments.push(seg)
            }
        }
        return keptSegments

    }
    drawSegment(ctx) {
        this.segments.forEach(p => p.draw(ctx, {color: getRandomColor()}))
    }

    draw(ctx, {stroke = 'blue', lineWidth = 2, fill = "rgba(0,0,255,0.3)"} = {}) {
        if (!this.points?.length) return;
        ctx.beginPath()
        style(ctx,{fill, stroke, lineWidth})
        ctx.moveTo(this.points[0].x, this.points[0].y)
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    }

    static multiBreak(polys) {
        for (let i = 0; i < polys.length; i++) {
            for (let poly2 of polys.slice(i + 1)) {
                Polygon.break(polys[i], poly2)
            }
        }
    }

    static break(poly1, poly2) {
        const segs1 = poly1.segments
        const segs2 = poly2.segments
        let counter = 0
        for (let i = 0; i < segs1.length; i++) {
            for (let j = 0; j < segs2.length; j++) {
                let seg1 = segs1[i], seg2 = segs2[j];
                counter++
                let int = getIntersection(seg1, seg2)
                if (int && ![0, 1].includes(int.offset)) {
                    let point = new Point(int.x, int.y)
                    let aux1 = seg1.p2
                    seg1.p2 = point
                    segs1.splice(i + 1, 0, new Segment(point, aux1))
                    let aux2 = seg2.p2
                    seg2.p2 = point
                    segs2.splice(i + 1, 0, new Segment(point, aux2))
                }
            }
        }
        console.log(counter)
    }

}