import Marking from "../bases/marking.js";

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