import {angle} from "../utils/algebra-math-utils.js";
import Marking from "../bases/marking.js";

export default class Parking extends Marking{
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.borders = [this.poly.segments.at(0),this.poly.segments.at(2)]
    }

    draw(ctx, viewPoint) {
        this.borders[0].draw(ctx, {width:5, color:'white'})
        this.borders[1].draw(ctx, {width:5, color:'white'})
        ctx.save()
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(angle(this.directionVector))

        ctx.beginPath()
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        ctx.fillStyle = "white"
        ctx.font = `bold ${this.height}px Arial`;
        ctx.fillText("P",0,1)

        ctx.moveTo(this.center.x,this.center.y)

        ctx.restore()
    }
}