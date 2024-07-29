export default class Segment {
    constructor(p1, p2, shape='line') {
        this.p1 = p1;
        this.p2 = p2;
        this.shape = shape
        // todo: make arc shape. and make intersection for it
    }

    draw(ctx, {width = 2, color = "black", dash=null} = {}) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        if(dash)
            ctx.setLineDash(dash)
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke()
        ctx.setLineDash([])

    }
    equal(seg){
        let {p1, p2} = this;
        return (p1.equal(seg.p1) && p2.equal(seg.p2))
            || (p1.equal(seg.p2) && p2.equal(seg.p1));

    }
    contains(point){
        return this.p1.equal(point) || this.p2.equal(point);
    }

}