import Point from "./primitives/point.js";
import {getNearestPoint} from "./math/utils.js";
import Segment from "./primitives/segment.js";

export default class GraphEditor {
    constructor(viewPort, graph) {

        this.viewPort = viewPort
        this.canvas = viewPort.canvas
        this.graph = graph

        this.ctx = this.canvas.getContext('2d');

        this.selected = null
        this.hovered = null
        this.draging = false
        this.mouse = null

        this.#addEventListeners()
    }

    getNearestPoint(point, excludes = []) {
        let  points = this.graph.points.filter(p=> !excludes.includes(p))
        return getNearestPoint(point, points, 20 * this.viewPort.zoom)
    }

    #addEventListeners() {
        let mousedownPoint = null
        this.canvas.addEventListener('mousedown', (e) => {
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
                    mousedownPoint = this.mouse
                } else {
                    // if not create and add a new point
                    if (this.graph.addPoint(this.mouse))
                        console.log('add new point at', this.mouse)
                    this.#selectPoint(this.mouse)
                }
            }
        })
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse = this.viewPort.getMouse(e, true)
            this.hovered = this.getNearestPoint(this.mouse,[this.draging])
            if (this.draging) {
                this.draging.x = this.mouse.x
                this.draging.y = this.mouse.y
            }
        })

        this.canvas.addEventListener('mouseup', (e) => {
                if (e.button == 0) {// left click
                    if (mousedownPoint.equal(this.mouse)) {
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
                        if ( this.hovered && this.draging) {
                            this.graph.segments.forEach(seg => seg.replacePoint(this.draging, this.hovered))
                            this.graph.removePoint(this.draging)

                        }
                        this.draging = null
                    }
                }
            }
        )

        this.canvas.addEventListener('mouseleave', (e) => this.selected = null)
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())

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