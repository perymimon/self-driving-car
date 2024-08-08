import Segment from "../primitives/segment.js";
import {translate, angle} from "../math/utils.js";
import Envelope from "../primitives/envelope.js";
import Marking from "./marking.js";

export default class Start extends Marking{
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.img = new Image()
        this.img.onload = function (){       }
        this.img.src = '/world-editor/car.png'

    }

    draw(ctx, viewPoint) {

        // this.poly.draw(ctx, viewPoint);
        ctx.save()
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(angle(this.directionVector) - Math.PI / 2)
        ctx.drawImage(this.img, -this.img.width/2, -this.img.height/2);
        ctx.restore()
    }
}