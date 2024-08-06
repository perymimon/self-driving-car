export default class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    draw(ctx, {size = 18, color="black", outline = false, fill=false} = {}){
        const radius = size / 2
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false)
        ctx.fill()

        if(outline){
            ctx.beginPath()
            ctx.lineWidth = 3
            ctx.strokeStyle = 'red'
            ctx.arc(this.x, this.y, radius , 0, Math.PI * 2)
            ctx.stroke()
        }
        if(fill){
            ctx.beginPath()
            ctx.fillStyle = 'red'
            ctx.arc(this.x, this.y, radius * 0.4, 0, Math.PI * 2)
            ctx.fill()
        }

    }
    equal(p){
        return p.x === this.x && p.y === this.y
    }
}