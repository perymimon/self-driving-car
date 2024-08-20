import Point from '../primitives/point.js'
import Segment from '../primitives/segment.js'
import Dispatcher from "../bases/dispatcher.js";
import {getNearestSegment, getShortestPath} from "../utils/math-utils.js";

export default class Graph extends Dispatcher {
    constructor(points = [], segments = []) {
        super()
        this.points = points;
        this.segments = segments;
    }

    static Load(info) {
        const points = info.points.map(p => Point.load(p))
        // let pointMap = new Map(points.map((o,i)=> [o.id, o]))

        const segments = info.segments.map(seg => new Segment(
            points.find(p => p.equal(seg.p1)),
            points.find(p => p.equal(seg.p2))
        ))
        return new Graph(points, segments)
    }

    hash() {
        return JSON.stringify(this)
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
        this.trigger('update')
        return true
    }

    removePoint(point) {
        let i = this.points.findIndex(p => p.equal(point))
        if (i == -1) return false
        this.points.splice(i, 1)
        let segments = this.segments.filter(seg => seg.includes(point))
        for (let seg of segments) {
            this.removeSegment(seg)
        }
        this.trigger('update')
        return true
    }

    getSegmentsWithPoint(point) {
        let segs = []
        for (let seg of this.segments) {
            if (seg.includes(point))
                segs.push(seg)
        }
        return segs
    }

    getSegmentsLeavingFromPoint(point) {
        let segs = []
        for (let seg of this.segments) {
            if (seg.oneWay && seg.p1.equal(point)) {
                segs.push(seg)
            } else if (seg.includes(point))
                segs.push(seg)
        }
        return segs
    }

    getConnectedPoints(point) {
        let segs = this.getSegmentsWithPoint(point)
        return segs.map(seg => ({
            p: seg.p1.equal(point) ? seg.p2 : seg.p1,
            dist: seg.length()
        }))
    }

    getShortestPath(start, end) {
        var startSeg = getNearestSegment(start, this.segments)
        var endSeg = getNearestSegment(end, this.segments)

        var {point:projStart} = startSeg.projectPoint(start)
        var {point:projEnd} = endSeg.projectPoint(end)

        var tempSeg = [
            new Segment(startSeg.p1, projStart),
            new Segment(projStart, startSeg.p2 ),
            new Segment(endSeg.p1, projEnd),
            new Segment(projEnd, endSeg.p2 ),
        ]
        if(startSeg.equal(endSeg))
            tempSeg.push(new Segment(projStart, projEnd))

        this.points.push(projStart,projEnd)
        this.segments.push(...tempSeg)

        let path = getShortestPath(projStart, projEnd, this)

        this.removePoint(projStart)
        this.removePoint(projEnd)

        return path

    }

    dispose() {
        this.points = [];
        this.segments = [];
        this.trigger('update')
    }

    pointExists(point) {
        return this.points.some(p => p.equal(point))
    }

    addSegment(seg) {
        if (this.segmentExists(seg)) return false
        this.segments.push(seg)
        this.trigger('update')
        return true
    }

    segmentExists(segment) {
        return this.segments.some(seg => segment.equal(seg))
    }

    removeSegment(segment) {
        let i = this.segments.findIndex(seg => seg.equal(segment))
        if (i == -1) return false
        this.segments.splice(i, 1)
        this.trigger('update')
        return true
    }

}