import Segment from "../primitives/segment.js";
import {translate, angle} from "../math/utils.js";
import Envelope from "../primitives/envelope.js";
import Marking from "./marking.js";

export default class Stop extends Marking{
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.border = this.poly.segments.at(2)
    }

    draw(ctx, viewPoint) {
        this.border.draw(ctx, {width:5, color:'white'})
        // this.poly.draw(ctx, viewPoint);
        ctx.save()
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(angle(this.directionVector) - Math.PI / 2)
        ctx.scale(1,3)

        ctx.beginPath()
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        ctx.fillStyle = "white"
        ctx.font = `bold ${this.height * .3}px Arial`;
        ctx.fillText("STOP",0,1)

        ctx.restore()
    }
}