import Segment from "../primitives/segment.js";
import {add, lerp2D, perpendicular, scale} from "../utils/math-utils.js";
import Marking from "../bases/marking.js";

export default class Light extends Marking {
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        let perp = perpendicular(this.directionVector)

        let line = new Segment(
            add(this.center, scale(perp, -this.width / 2)),
            add(this.center, scale(perp, this.width / 2))
        )

        this.statuses = [{
            point: lerp2D(line.p1, line.p2, 0.8),
            color: '#600',
            activeColor:'#F00'
        }, {
            point: lerp2D(line.p1, line.p2, 0.5),
            color: '#660',
            activeColor:'#FF0'
        }, {
            point: lerp2D(line.p1, line.p2, 0.2),
            color: '#060',
            activeColor:'#0F0'
        }];
        this.status = this.statuses.at(0)
    }
    changeStatus(i){
        let len = this.statuses.length
        this.status = this.statuses.at(i % len)
    }

    draw(ctx, viewPoint) {
        ctx.save()
        // ctx.translate(this.center.x, this.center.y)
        // style(ctx,{fill:"white"})
        // let light = new Envelope(this.support, 20, 10).poly
        // light.draw(ctx, {fill: 'black', stroke:'black'})
        let [red,, green] = this.statuses
        new Segment(red.point, green.point).draw(ctx,{width:20, cap:'round'})
        for (let light of this.statuses) {
            ctx.globalAlpha = 0.5
            light.point.draw(ctx, {color: light.color, size: this.width * .25});
        }
        ctx.globalAlpha = 1
        let {point, activeColor} = this.status
        point.draw(ctx, {color: activeColor, size: this.width * .25});


        ctx.restore()
    }
}