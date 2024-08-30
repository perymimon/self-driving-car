import {getNearestPoint} from "../utils/algebra-math-utils.js";
import Segment from "../primitives/segment.js";
import Dispatcher from "../bases/dispatcher.js";

export default class GraphEditor extends Dispatcher {

    constructor(viewPort, world) {
        super()
        this.viewPort = viewPort
        this.canvas = viewPort.canvas
        this.world = world
        this.graph = world.graph

        this.ctx = this.canvas.getContext('2d');

        this.selected = null
        this.hovered = null
        this.draging = false
        this.mouse = null
        this.mousedown = null //point

        this.start = null
        this.end = null

        this.canvas.setAttribute('tabindex', '0');

        this.listeners = {
            mousedown: this.#handleMouseDown.bind(this),
            mousemove: this.#handleMouseMove.bind(this),
            mouseup: this.#handleMouseUp.bind(this),
            mouseLeave: (e) => this.selected = null,
            keydown: this.#handleKeyDown.bind(this),
        }

        this.#addEventListeners()
    }

    getNearestPoint(point, excludes = []) {
        let points = this.graph.points.filter(p => !excludes.includes(p))
        return getNearestPoint(point, points, 20 * this.viewPort.zoom)
    }

    enable() {
        this.#addEventListeners()
    }

    disable() {
        this.#removeEventListener()
    }

    #handleKeyDown(e) {
        if (e.key == 's') {
            console.log('start', this.mouse)
            this.start = this.mouse
        }
        if (e.key == 'e') {
            console.log('end', this.mouse)
            this.end = this.mouse
        }
        if (this.start && this.end) {
            this.world.generateCorridor(this.start, this.end)
        }
    }

    #handleMouseDown(e) {
        if (e.button === 2) { //right click
            if (this.selected) {
                this.selected = null

            } else if (this.hovered) {
                this.#removePoint(this.hovered)
            }
        } else if (e.button == 0) { // left down
            if (this.hovered) {
                // If hovered just select the node
                // this.#selectPoint(this.hovered)
                this.draging = this.hovered
                this.mousedown = this.mouse
            } else {
                // if not create and add a new point
                if (this.graph.addPoint(this.mouse))
                    console.log('add new point at', this.mouse)
                this.#selectPoint(this.mouse)
            }
        }
    }

    #handleMouseMove(e) {
        setTimeout(() => this.canvas.focus(), 0)
        window.focus()
        console.log('mouse move')
        this.mouse = this.viewPort.getMouse(e, true)
        this.hovered = this.getNearestPoint(this.mouse, [this.draging])
        if (this.draging) {
            this.draging.x = this.mouse.x
            this.draging.y = this.mouse.y
        }
    }

    #handleMouseUp(e) {
        if (e.button == 0) {// left click
            if (this.mousedown?.equal(this.mouse)) {
                if (this.hovered) {
                    // If hovered just select the node
                    this.#selectPoint(this.hovered)
                    this.draging = null
                } else {
                    // if not create and add a new point
                    if (this.graph.addPoint(this.mouse))
                        console.log('add new point at', this.mouse)
                    this.#selectPoint(this.mouse)
                }
            } else { // dragging
                if (this.hovered && this.draging) {
                    this.graph.segments.forEach(seg => seg.replacePoint(this.draging, this.hovered))
                    this.graph.removePoint(this.draging)

                }
                this.draging = null
            }
        }
    }

    #addEventListeners() {
        for (const [event, handler] of Object.entries(this.listeners)) {
            this.canvas.addEventListener(event.toLowerCase(), handler, {passive: true});
        }

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())

    }

    #removeEventListener() {
        for (const [event, handler] of Object.entries(this.listeners)) {
            this.canvas.removeEventListener(event.toLowerCase(), handler, {passive: true});
        }
    }

    #selectPoint(point) {
        if (this.selected)
            this.graph.addSegment(new Segment(this.selected, point))
        // If hovered just select the node
        this.selected = point
    }

    #removePoint(point) {
        if (this.graph.removePoint(point))
            console.log('remove point at', point)
        this.hovered = null
        if (this.selected == this.hovered)
            this.selected = null
    }

    dispose() {
        this.graph.dispose()
        this.selected = null
        this.hovered = null
    }

    display() {
        let {ctx} = this
        this.graph.draw(ctx);

        let asset = this.hovered ? this.hovered : this.mouse

        if (this.selected) {
            new Segment(this.selected, asset).draw(ctx, {dash: [3, 3]})
            this.selected.draw(this.ctx, {outline: true});

        }

        if (this.hovered)
            this.hovered.draw(ctx, {fill: true});

    }


}