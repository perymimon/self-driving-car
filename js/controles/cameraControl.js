import MarkerDetector from "../math/markerDetector.js";
import {waitToEvent} from "../utils/codeflow-utils.js";

export default class CameraControl {
    sizeChangeThreshold = 0.7;

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d',{willReadFrequently :true});
        this.tilt = 0
        this.forward = true
        this.reverse = false

        this.expectedSize = 0
        this.markerDetected = new MarkerDetector(ironManCanvas)

        navigator.mediaDevices.getUserMedia({video: true})
            .then(async mediaStream => {
                this.video = document.createElement("video");
                this.video.srcObject = mediaStream;
                this.video.play()
                await waitToEvent(this.video, 'loadeddata')
                this.canvas.width = this.video.videoWidth / 4;
                this.canvas.height = this.video.videoHeight / 4;
                this.#loop()
            })

    }

    #loop() {
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        let imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let res = this.markerDetected.detect(imgData);
        if (res) {
            this.#processMarkers(res)
        }
        requestAnimationFrame(_ => this.#loop())
    }

    #processMarkers({leftMarker, rightMarker} = {}) {

        if (rightMarker.radius == 0 || rightMarker.radius == 0) {
            this.reverse = false
            this.forward = false
            this.expectedSize = 0
            return
        }

        this.tilt = Math.atan2(
            leftMarker.centeroid.y - rightMarker.centeroid.y,
            rightMarker.centeroid.x - rightMarker.centeroid.x
        )
        this.tilt /= 4 // slow it a bit

        var size = (leftMarker.radius + rightMarker.radius) / 2
        if (this.expectedSize * this.sizeChangeThreshold > size) {
            this.reverse = true
            this.forward = false
            this.expectedSize = size
        } else if (this.expectedSize / this.sizeChangeThreshold < size) {
            this.reverse = false
            this.forward = true
            this.expectedSize = size
        }
        var color = 'black'
        if (this.reverse) color = 'red'
        if (this.forward) color = 'blue'

        leftMarker.centeroid.draw(this.ctx, {color, size:leftMarker.radius})
        rightMarker.centeroid.draw(this.ctx, {color, size:rightMarker.radius})
    }
}