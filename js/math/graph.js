import Point from '../primitives/point.js'
import Segment from '../primitives/segment.js'
import {DispatcherWithWeakRef} from "../bases/dispatcher.js";
import {add, getNearestSegment, getShortestPath, scale} from "../utils/algebra-math-utils.js";

export default class Graph extends DispatcherWithWeakRef {
    constructor(points = [], segments = [], tracePoints = false) {
        super()
        this.points = points;
        this.segments = segments;
        if(tracePoints)
        for (let p of points){
            p.addEventListener('change',_=> this.#triggerChange())
        }
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
    #triggerChange(){
        this.trigger('change')
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
        this.#triggerChange()
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
        this.#triggerChange()
        return true
    }
    addSegment(seg) {
        if (this.segmentExists(seg)) return false
        this.segments.push(seg)
        this.#triggerChange()
        return true
    }

    segmentExists(segment) {
        return this.segments.some(seg => segment.equal(seg))
    }

    removeSegment(segment) {
        let i = this.segments.findIndex(seg => seg.equal(segment))
        if (i == -1) return false
        this.segments.splice(i, 1)
        this.#triggerChange()
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

    getShortestPath(start, end, extendTheEdges = true) {
        var startSeg = getNearestSegment(start, this.segments)
        var endSeg = getNearestSegment(end, this.segments)

        var {point: projStart} = startSeg.projectPoint(start)
        var {point: projEnd} = endSeg.projectPoint(end)
        var startPoint = projStart
        var endPoint = projEnd
        var tempSegs = []
        if (startSeg.equal(endSeg))
            tempSegs.push(new Segment(startPoint, endPoint))

        if (extendTheEdges) {
            startPoint = add(projStart, scale(startSeg.directionVector(), -10))
            endPoint = add(projEnd, scale(endSeg.directionVector(), 100))
            tempSegs.push(
                new Segment(startSeg.p1, startPoint),
                new Segment(startPoint, startSeg.p2),
                new Segment(endSeg.p1, endPoint),
                new Segment(endPoint, endSeg.p2),
            )
        }


        this.points.push(startPoint, endPoint)
        this.segments.push(...tempSegs)

        let path = getShortestPath(startPoint, endPoint, this)

        this.removePoint(startPoint)
        this.removePoint(endPoint)

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



}