export default class PhoneControls {


    constructor(canvas) {
        this.tilt = 0
        this.tilt2 = 0
        this.canvas = canvas
        this.forward = true
        this.reverse = false
        this.canvasAngle = 0
        this.listeners = {
            deviceorientation: this.#handleDeviceorientation.bind(this),
            touchstart: this.#handleTouchStart.bind(this),
            touchEnd: this.#handleTouchEnd.bind(this),
            // devicemotion: this.#handleDevicemotion.bind(this),
        }

        this.#addEventListeners()
    }

    #handleDeviceorientation(e) {
        this.tilt = e.beta * Math.PI / 180
        let canvasAngle = -this.tilt
        this.canvas.style.rotate = `${canvasAngle}rad`
    }

    #handleDevicemotion(e) {
        this.tilt = Math.atan2(
            e.accelerationIncludingGravity.y,
            e.accelerationIncludingGravity.x
        )
        let newCanvasAngle = -this.tilt
        let t = 0.1
        if (Math.abs(newCanvasAngle - this.canvasAngle) > 0.1) {
            this.canvasAngle = newCanvasAngle
        }
        this.canvas.style.rotate = `${this.canvasAngle}rad`
    }

    #handleTouchStart(e) {
        this.forward = false
        this.reverse = true
    }

    #handleTouchEnd(e) {
        this.forward = true
        this.reverse = false
    }

    #addEventListeners() {
        for (const [event, handler] of Object.entries(this.listeners)) {
            window.addEventListener(event.toLowerCase(), handler, {passive: true});
        }

        window.addEventListener('contextmenu', (e) => e.preventDefault())

    }

    #removeEventListener() {
        for (const [event, handler] of Object.entries(this.listeners)) {
            window.removeEventListener(event.toLowerCase(), handler, {passive: true});
        }
    }
}