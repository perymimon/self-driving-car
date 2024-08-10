export default class Point  extends EventTarget{
    #x =0
    #y = 0
    static count = 0
    constructor(x, y) {
        super()
        this.#x = x;
        this.#y = y;
        this.id = Point.count++
    }
    set x(v){
        this.#x = v
        this.#trigger('change',{key:'x',value:v})
    }
    get x(){
        return this.#x
    }
    set y(v){
        this.#y = v
        this.#trigger('change',{key:'y',value:v})
    }
    get y(){
        return this.#y
    }
    toJSON(){
        let {x, y} = this
        return {x,y}
    }
    static load(p){
        return new Point(p.x, p.y)
    }
    #trigger(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        this.dispatchEvent(event);
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