import Segment from "../primitives/segment.js";
import {translate, angle} from "../math/utils.js";
import Envelope from "../primitives/envelope.js";
import Marking from "./marking.js";
import {style} from "../canvas-utils.js";

export default class Target extends Marking{
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
    }

    draw(ctx, viewPoint) {
        ctx.save()
        ctx.beginPath()
        this.center
            .draw(ctx, {width: this.width / 4, color:'white ', outline:true , fill:true});
        ctx.restore()
    }
}