import {DispatcherWithWeakRef} from "../bases/dispatcher.js";
import {getNearestPolygon} from "../utils/algebra-math-utils.js";

export const SELECTED = 'selected', CANCEL = 'cancel'

export class PolygonSelector extends DispatcherWithWeakRef {

    constructor(viewPort, polygons) {
        super()
        this.viewPort = viewPort;
        this.polygons = polygons;
        this.listeners = {
            mousemove: this.#handleMouseMove.bind(this),
            mousedown: this.#handleMouseDown.bind(this),
        }
        this.intent = null
        this.selected = null
    }
    setPolygons(polygons) {
        this.polygons = polygons;
        this.selected = null
        this.intent = null
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

        this.intent = getNearestPolygon(
            this.mouse,
            this.polygons,
            10 * this.viewPort.zoom
        )
    }

    #handleMouseDown(evt) {

        if (evt.button == 0) { // left click
            if (this.intent) {
                this.selected = this.intent
                this.intent = null
                this.trigger(SELECTED, this.selected)
            }
        }
        if (evt.button == 2) {// right click
            this.selected = null
            this.trigger(CANCEL, null)

        }
    }

}