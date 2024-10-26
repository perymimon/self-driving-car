import Segment from "../../primitives/segment.js";
import {add, perpendicular, scale} from "../../utils/algebra-math-utils.js";
import Marking from "../../bases/marking.js";

export default class Cross extends Marking{
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.borders = [this.poly.segments.at(0),this.poly.segments.at(2)]
    }

    draw(ctx, viewPoint) {
        let perp = perpendicular(this.directionVector)
        let line = new Segment(
            add(this.center, scale(perp, this.width / 2)),
            add(this.center, scale(perp, -this.width / 2))
        )
        line.draw(ctx, {width: this.height,color:"white",dash:[11,11]})
        // this.borders.forEach(line => line.draw(ctx, viewPoint))
    }
}