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


    #addEventListeners() {
        const {viewPort} = this
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse = viewPort.getMouse(e, true)
            this.hovered = getNearestPoint(this.mouse, this.graph.points, 20 * viewPort.zoom)
            if (this.draging){
                this.selected.x = this.mouse.x
                this.selected.y = this.mouse.y
            }
        })
        this.canvas.addEventListener('click', (e) => {
            if (e.button == 0) { // left click

            }
        })
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { //right click
                if (this.selected) {
                    this.selected = null

                } else if (this.hovered) {
                    this.#removePoint(this.hovered)
                }
            } else if (e.button == 0) { // left click
                if (this.hovered) {
                    // If hovered just select the node
                    this.#selectPoint(this.hovered)
                    this.draging = true
                } else {
                    // if not create and add a new point
                    if (this.graph.addPoint(this.mouse))
                        console.log('add new point at', this.mouse)
                    this.#selectPoint(this.mouse)
                }
            }
        })

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
        this.canvas.addEventListener('mouseup', (e) => (this.draging = false),(this.selected = null) )
        this.canvas.addEventListener('mouseleave', (e) => this.selected = null)

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
    dispose(){
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