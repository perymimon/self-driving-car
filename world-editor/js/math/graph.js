import Point from '../primitives/point.js'
import Segment from '../primitives/segment.js'

export default class Graph {
    constructor(points = [], segments = []) {
        this.points = points;
        this.segments = segments;
    }

    static Load(info) {
        const points = info.points.map(p => Point.load(p))
        const segments = info.segments.map(seg => new Segment(
            points.find(p => p.equal(seg.p1)),
            points.find(p => p.equal(seg.p2))
        ))
        return new Graph(points, segments)
    }

    draw(ctx) {
        for (let seg of this.segments) {
            seg.draw(ctx);
        }

        for (let point of this.points) {
            point.draw(ctx);
        }

    }

    addPoint(point) {
        if (this.pointExists(point)) return false
        this.points.push(point)
        return true
    }

    removePoint(point) {
        let i = this.points.findIndex(p => p.equal(point))
        if (i == -1) return false
        this.points.splice(i, 1)
        let segments = this.segments.filter(seg => seg.contains(point))
        for (let seg of segments) {
            this.removeSegment(seg)
        }
        return true
    }

    dispose() {
        this.points = [];
        this.segments = [];
    }

    pointExists(point) {
        return this.points.some(p => p.equal(point))
    }

    addSegment(seg) {
        if (this.segmentExists(seg)) return false
        this.segments.push(seg)
        return true
    }

    segmentExists(segment) {
        return this.segments.some(seg => segment.equal(seg))
    }

    removeSegment(segment) {
        let i = this.segments.findIndex(seg => seg.equal(segment))
        if (i == -1) return false
        this.segments.splice(i, 1)
        return true
    }

}