import Point from "../primitives/point.js";
import {distance} from "../utils/algebra-math-utils.js";

export default class MarkerDetector {
    constructor() {
        this.threshold = document.createElement("input")
        this.threshold.type = 'range'
        this.threshold.id = 'temp'
        this.threshold.min = 0
        this.threshold.max = 255
        this.threshold.value = 177
    }

    #averagePoint(points) {
        let center = new Point(0, 0)
        for (let point of points) {
            center.x += point.x
            center.y += point.y
        }
        center.x /= points.length
        center.y /= points.length

        return center
    }

    #index(x, y, imgData) {
        return (y * imgData.width + x) * 4
    }

    #xy(i, imgData) {
        let index = i / 4
        let y = Math.floor(index / imgData.width)
        let x = index % imgData.width
        return {x, y}
    }

    detect(imgData) {
        var points = []
        var env = {r: 0, g: 0, b: 0}
        // let debugImageData = new ImageData(imgData.data, imgData.width, imgData.height);
        var threshold = this.threshold.value
        this.#increaseContrast(imgData, 50);
        this.#meanFilter(imgData, 2);
        // this.#emphasizeBlue(threshold, .05, imgData)

        for (let i = 0; i < imgData.data.length; i += 4) {
            let r = imgData.data[i] - env.r
            let g = imgData.data[i + 1] - env.g
            let b = imgData.data[i + 2] - env.b
            let a = imgData.data[i + 3]

            // Magic formula
            let blueness = b * 2.2 - (r + g)

            if (blueness > threshold) {
                let {x, y} = this.#xy(i, imgData)
                points.push({x, y, blueness, index: i})
            }
        }
        let centeroid1 = points.at(0)
        let centeroid2 = points.at(-1)

        let group1, group2

        for (let i = 0; i < 2; i++) {
            group1 = []
            group2 = []
            for (let point of points) {
                if (distance(centeroid1, point) < distance(centeroid2, point)) {
                    group1.push(point)
                } else {
                    group2.push(point)
                }
            }

            centeroid2 = this.#averagePoint(group2)
            centeroid1 = this.#averagePoint(group1)
        }

        let size1 = Math.sqrt(group1.length)
        let radius1 = size1 / 2;

        let size2 = Math.sqrt(group2.length)
        let radius2 = size2 / 2;

        let marker1 = {
            centeroid: centeroid1,
            radius: radius1,
            points: group1
        }
        let marker2 = {
            centeroid: centeroid2,
            radius: radius2,
            points: group2
        }

        return {
            leftMarker: marker1.centeroid.x < marker2.centeroid.x ? marker1 : marker2,
            rightMarker: marker1.centeroid.x < marker2.centeroid.x ? marker2 : marker1,
        }
    }

    #emphasizeBlue(threshold, boost,  imgData) {
        let data = imgData.data
        let ch = 2
        for (let index = 0; index < data.length; index += 4) {
            let r = data[index + 0]
            let g = data[index + 1]
            let b = data[index + 2]
            let blueness = b * 2.2 - (r + g)
            if (blueness > threshold) {
                let {x, y} = this.#xy(index, imgData)
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        // if(i==0 && j==0) continue
                        let index = this.#index(x + i, y + j, imgData)
                        imgData.data[index + ch] += boost * b
                    }
                }
            }

        }
    }

    #meanFilter(imageData, radius) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let rSum = 0, gSum = 0, bSum = 0

            let {x, y} = this.#xy(i, imageData)
            let count = 0
            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    let index = this.#index(x + kx, y + ky, imageData)
                    if (index) {
                        rSum += data[index + 0]
                        gSum += data[index + 1]
                        bSum += data[index + 2]
                        count++
                    }
                }
            }
            data[i + 0] = rSum / count
            data[i + 1] = gSum / count
            data[i + 2] = bSum / count
        }

        return imageData;
    }

    #increaseContrast(imageData, contrast) {
        const data = imageData.data;
        contrast = (contrast / 100) + 1;  // להפוך את הקונטרסט לאחוזים
        const intercept = 128 * (1 - contrast); // ההיסט לשמירת הבהירות

        for (let i = 0; i < data.length; i += 4) {
            // טיפול בערוצי הצבע (RGB)
            // data[i] = data[i] * contrast + intercept;     // ערוץ אדום
            // data[i + 1] = data[i + 1] * contrast + intercept; // ערוץ ירוק
            data[i + 2] = data[i + 2] * contrast + intercept; // ערוץ כחול
        }

        return imageData;
    }

}