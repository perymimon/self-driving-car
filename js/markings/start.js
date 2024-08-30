import {angle} from "../utils/algebra-math-utils.js";
import Marking from "../bases/marking.js";

export default class Start extends Marking{
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.img = new Image()
        this.img.onload = function (){       }
        this.img.src = '../car.png'

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