import Point from "./primitives/point.js";
import {add, subtract, scale} from "./math/utils.js";

export default class Viewport {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.zoom = 1
        this.center = new Point(canvas.width / 2, canvas.height / 2);
        this.offset = scale(this.center, -1)

        this.drag = {
            start: new Point(0, 0),
            end: new Point(0, 0),
            offset: new Point(0, 0),
            active: false,
        }

        this.#addEventListener()
    }

    getMouse(evt, subtractDragOffset) {
        let p = new Point(
            (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
            (evt.offsetY - this.center.y) * this.zoom - this.offset.y
        )
        return subtractDragOffset ? subtract(p, this.drag.offset) : p
    }

    getOffset() {
        return add(this.offset, this.drag.offset);
    }
    reset(){
        let {ctx,canvas, center, zoom} = this
        ctx.restore()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()
        ctx.translate(center.x, center.y)
        // ctx.scale(.5, .5)
        ctx.scale(1 / zoom, 1 / zoom)
        let offset = this.getOffset()
        ctx.translate(offset.x, offset.y)
    }

    #addEventListener() {
        this.canvas.addEventListener('mousewheel', this.#handleMouseWheel.bind(this), { passive: true })
        this.canvas.addEventListener('mousedown', this.#handleMouseDown.bind(this), { passive: true })
        this.canvas.addEventListener('mousemove', this.#handleMouseMove.bind(this), { passive: true })
        this.canvas.addEventListener('mouseup', this.#handleMouseUp.bind(this), { passive: true })

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
        this.zoom = Math.max(1, Math.min(this.zoom, 5))
    }
}