import Point from "./primitives/point.js";
import {add, scale, subtract} from "./utils/algebra-math-utils.js";
import Polygon from "./primitives/polygon.js";
import {DispatcherWithWeakRef} from "./bases/dispatcher.js";

export default class Viewport extends DispatcherWithWeakRef {

    constructor(canvas, zoom = 1, offset = null) {
        super()
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.zoom = zoom
        this.center = new Point(canvas.width / 2, canvas.height / 2);
        console.log('center', this.center)
        this.offset = offset || scale(this.center, -1)
        this.maxZoom = 10
        this.drag = {
            start: new Point(0, 0),
            end: new Point(0, 0),
            offset: new Point(0, 0),
            active: false,
        }

        this.#addEventListener()

    }

    getRenderBox() {
        let {zoom, center} = this
        let offset = scale(this.getOffset(), -1)
        let left = offset.x - zoom * center.x
        let right = offset.x + zoom * center.x
        let top = offset.y - zoom * center.y
        let bottom = offset.y + zoom * center.y
        return {left, top, bottom, right}
    }

    drawRenderBox(ctx) {
        let {center} = this
        let {left, top, bottom, right} = this.getRenderBox()
        let p1 = new Point(left, top)
        let p2 = new Point(right, top)
        let p3 = new Point(right, bottom)
        let p4 = new Point(left, bottom)

        let border = new Polygon([p1, p2, p3, p4])
        border.draw(ctx, {lineWidth: 10})
        center.draw(ctx)
    }
    segmentsInView(segments = [], box = this.getRenderBox()){
        return segments.filter(
            seg => this.inView([seg.p1, seg.p2], box)
        );
    }
    inView(points = [], box = this.getRenderBox()) {
        let {left, top, bottom, right} = box
        return points.some(point => {
            if (point.x < left) return false
            if (point.y < top) return false
            if (point.x > right) return false
            if (point.y > bottom) return false
            return true
        })
    }

    getMouse(evt, subtractDragOffset) {
        let p = new Point(
            (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
            (evt.offsetY - this.center.y) * this.zoom - this.offset.y
        )
        return subtractDragOffset ? subtract(p, this.drag.offset) : p
    }

    getOffset() {
        let currentOffset = add(this.offset, this.drag.offset);
        // this.sameOffset = this.lastOffset ? currentOffset.equal(this.lastOffset) : false
        // this.lastOffset = currentOffset
        return currentOffset;
    }

    reset() {
        let {ctx, canvas, zoom} = this
        let center = this.center = new Point(canvas.width / 2, canvas.height / 2);
        ctx.restore()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.scale(1 / zoom, 1 / zoom)
        let offset = this.getOffset()
        ctx.translate(offset.x, offset.y)
    }

    #addEventListener() {
        this.canvas.addEventListener('mousewheel', this.#handleMouseWheel.bind(this), {passive: true})
        this.canvas.addEventListener('mousedown', this.#handleMouseDown.bind(this), {passive: true})
        this.canvas.addEventListener('mousemove', this.#handleMouseMove.bind(this), {passive: true})
        this.canvas.addEventListener('mouseup', this.#handleMouseUp.bind(this), {passive: true})
    }

    #handleMouseDown(event) {
        if (event.button == 1) {
            // middle button
            this.drag.start = this.getMouse(event)
            this.drag.active = true
        }
    }

    #handleMouseMove(event) {
        if (this.drag.active) {
            this.drag.end = this.getMouse(event)
            this.drag.offset = subtract(this.drag.end, this.drag.start)
            this.trigger('change', {})
        }
    }

    #handleMouseUp(event) {
        if (this.drag.active) {
            this.offset = add(this.offset, this.drag.offset)
            this.drag = {
                start: new Point(0, 0),
                end: new Point(0, 0),
                offset: new Point(0, 0),
                active: false,
            }
        }
    }

    #handleMouseWheel(event) {
        let dir = Math.sign(event.deltaY)
        let step = 0.1
        this.zoom += dir * step
        this.zoom = Math.max(1, Math.min(this.zoom, this.maxZoom))
        this.trigger('change', {})
    }
}