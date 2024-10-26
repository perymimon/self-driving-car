import {getNearestSegment, inRange} from "../utils/algebra-math-utils.js";
import {DispatcherWithWeakRef} from "../bases/dispatcher.js";
import {$get} from "../utils/codeflow-utils.js";

export const CHANGE = 'change', ADD = 'add', REMOVE = 'remove';
/**
 Gets legal segments and registers to mouse `move` and `down` events. Generates a temporary marking on the nearest
 legal segment. When the mouse is pressed down, it adds the marking to a list of markings.
 */
export default class _markingEditor extends DispatcherWithWeakRef {
    #segmentsInView = null
    #viewport = null

    constructor(viewport, world, targetSegmentsName) {
        super()
        this.clearSegmentsInView = () => {
            this.#segmentsInView = null
        }
        this.viewport = viewport;
        this.targetSegmentsName = targetSegmentsName;
        this.setWorld(world);

        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext('2d');

        this.listeners = {
            mousedown: this.#handleMouseDown.bind(this),
            mousemove: this.#handleMouseMove.bind(this),
        }

    }

    setWorld(world) {
        this.world?.removeEventListener('generate', this.clearSegmentsInView)
        this.world = world;
        this.#segmentsInView = null
        world.addEventListener('generate', this.clearSegmentsInView)

    }

    set viewport(viewport) {
        this.#viewport = viewport;
        viewport.addEventListener('change', this.clearSegmentsInView)
    }

    get viewport() {
        return this.#viewport;
    }

    // to be overwritten
    createMarking(center, directionVector) {
        return center
    }

    get segmentsInView() {
        if (this.#segmentsInView) return this.#segmentsInView
        var targetSegments = $get(this.world, this.targetSegmentsName)
        return this.#segmentsInView = this.viewport.segmentsInView(targetSegments)
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
        this.clearSegmentsInView()
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
        var markings = this.world.markings
        if (evt.button == 0) { // left click
            if (this.intent) {
                markings.push(this.intent)
                this.intent = null
                this.trigger(ADD, {type: this.intent})
                this.trigger(CHANGE, {type: this.intent})
            }
        }
        if (evt.button == 2) {// right click
            let underMouse = markings.filter(marking => marking.poly.containsPoint(this.mouse))
            for (let marking of underMouse) {
                markings.splice(markings.indexOf(marking), 1)
            }
            if (underMouse.length > 0) {
                this.trigger(ADD, {type: underMouse})
                this.trigger(CHANGE, {type: underMouse})
            }

        }
    }

    display() {
        if (this.intent)
            this.intent.draw(this.ctx)
    }
}