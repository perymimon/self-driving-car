import {getNearestSegment, inRange} from "../utils/algebra-math-utils.js";

export default class MarkingEditor {
    #segmentsInView = null
    #viewport = null

    constructor(viewport, world, targetSegments) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext('2d');

        this.listeners = {
            mousedown: this.#handleMouseDown.bind(this),
            mousemove: this.#handleMouseMove.bind(this),
        }

        this.targetSegments = targetSegments;

        this.markings = this.world.markings
    }

    set viewport(viewport) {
        this.#viewport = viewport;
        viewport.addEventListener('change', () => {
            this.#segmentsInView = null;
        })
    }

    get viewport() {
        return this.#viewport;
    }

    // to be overwritten
    createMarking(center, directionVector) {
        return center
    }

    get segmentsInView() {
        if (this.#segmentsInView) return this.#segmentsInView;
        return this.#segmentsInView = this.targetSegments.filter(
            seg => this.viewport.inView([seg.p1, seg.p2])
        );
    }

    #addEventListeners() {
        for (const [event, handler] of Object.entries(this.listeners)) {
            this.canvas.addEventListener(event, handler, {passive: true});
        }

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
    }

    #removeEventListener() {
        for (const [event, handler] of Object.entries(this.listeners)) {
            this.canvas.removeEventListener(event, handler, {passive: true});
        }
    }

    enable() {
        this.#addEventListeners()
    }

    disable() {
        this.#removeEventListener()
    }


    #handleMouseMove(evt) {
        this.mouse = this.viewport.getMouse(evt, true)

        let seg = getNearestSegment(
            this.mouse,
            this.segmentsInView,
            10 * this.viewport.zoom
        )
        if (seg) {
            const proj = seg.projectPoint(this.mouse)
            if (inRange(0, 1, proj.offset)) {
                this.intent = this.createMarking(
                    proj.point,
                    seg.directionVector()
                )
            }
            return true
        }
        this.intent = null
    }

    #handleMouseDown(evt) {
        if (evt.button == 0) // left click
            if (this.intent) {
                this.markings.push(this.intent)
                this.intent = null
            }
        if (evt.button == 2) // right click
            for (let i = 0; i < this.markings.length; i++) {
                let poly = this.markings[i].poly
                if (poly.containsPoint(this.mouse)) {
                    this.markings.splice(i, 1)
                    return
                }
            }
    }

    display() {
        if (this.intent)
            this.intent.draw(this.ctx)
    }
}