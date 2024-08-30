import Segment from "../primitives/segment.js";
import {translate, angle} from "../utils/algebra-math-utils.js";
import Envelope from "../primitives/envelope.js";



export default class Marking {
    constructor(center, directionVector, width, height) {
        this.type = this.constructor.name
        this.center = center
        this.directionVector = directionVector
        this.width = width
        this.height = height
        this.support = new Segment(
            translate(center, angle(directionVector), height / 2),
            translate(center, angle(directionVector), -height / 2),
        )
        this.poly = new Envelope(this.support, width, 0).poly

    }

    static load(info) {

    }

    draw(ctx, viewPoint) {
        this.poly.draw(ctx)
    }
}