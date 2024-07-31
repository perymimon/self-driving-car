import Segment from "./segment.js";
import {average, distance, getIntersection} from "../math/utils.js"
import Point from "./point.js";
import {drawText, getRandomColor, style} from "../cavas-utils.js";

export default class Polygon {
    static count = 0

    constructor(points, label) {
        this.points = points;
        this.segments = []
        for (var i = 1; i < points.length; i++)
            this.segments.push(new Segment(points[i - 1], points[i]));
        this.segments.push(new Segment(points[i - 1], points[0]));
        this.id = Polygon.count++
        this.label = label
    }

    containsSegment(seg) {
        const midPoint = average(seg.p1, seg.p2)
        return this.containsPoint(midPoint, seg.p2)
    }

    containsPoint(point) {
        const outerPoint = new Point(-10000, -10000)
        const crossSegment = new Segment(outerPoint, point)
        let intersectionCount = 0;
        for (const seg of this.segments) {
            const int = getIntersection(crossSegment, seg)
            if (int) intersectionCount++
        }
        return intersectionCount % 2 == 1
    }

    intersectPoly(poly) {
        for (let s1 of this.segments) {
            for (let s2 of poly.segments) {
                if (getIntersection(s1, s2)) return true
            }
        }
        return false
    }
    intersectCircumCircles(poly, spacing = 0){
        let dis = distance(this.centeroid(), poly.centeroid())
        return dis <= this.getRadius() + poly.getRadius() + spacing
    }
    // getCircumscribedRadius
    getRadius(poly) {
        let centroid = this.centeroid()
        return this.points.reduce((max, point) => {
            let dis = distance(point, centroid)
            return dis > max ? dis : max
        }, 0)
    }

    centeroid() {
        let {points} = this
        let xSum = 0;
        let ySum = 0;
        let signedArea = 0;

        const numPoints = points.length;

        for (let i = 0; i < numPoints; i++) {
            const x0 = points[i].x;
            const y0 = points[i].y;
            const x1 = points[(i + 1) % numPoints].x;
            const y1 = points[(i + 1) % numPoints].y;

            const a = x0 * y1 - x1 * y0;
            signedArea += a;
            xSum += (x0 + x1) * a;
            ySum += (y0 + y1) * a;
        }

        signedArea *= 0.5;
        const Cx = xSum / (6 * signedArea);
        const Cy = ySum / (6 * signedArea);

        return new Point(Cx, Cy);
    }

    drawSegment(ctx) {
        this.segments.forEach(p => p.draw(ctx, {color: getRandomColor()}))
    }

    distanceToPoint(point) {
        return Math.min(...this.segments.map((s) => s.distanceToPoint(point)));
    }

    distanceToPoly(poly) {
        return Math.min(...this.points.map((p) => poly.distanceToPoint(p)));
    }
    static union(polys) {
        Polygon.multiBreak(polys)
        const keptSegments = []
        for (let i = 0; i < polys.length; i++) {
            for (let seg of polys[i].segments) {
                let keep = true
                for (let j = 0; j < polys.length; j++) {
                    if (i == j) continue
                    if (polys[j].containsSegment(seg)) {
                        keep = false
                        break
                    }
                }
                if (keep)
                    keptSegments.push(seg)
            }
        }
        return keptSegments

    }



    draw(ctx, {stroke = 'blue', lineWidth = 2, fill = "rgba(0,0,255,0.3)", drawCenter = false, drawId = false} = {}) {
        if (!this.points?.length) return;
        ctx.beginPath()
        style(ctx, {fill, stroke, lineWidth})
        ctx.moveTo(this.points[0].x, this.points[0].y)
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        let center = this.centeroid()
        if (drawCenter) center.draw(ctx, {color: 'purple'})
        if (this.label) drawText(ctx, this.label, center.x, center.y)
        if (drawId) drawText(ctx, this.id, center.x, center.y)

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
        // console.log(counter)
    }

}