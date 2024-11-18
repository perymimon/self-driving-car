import {DispatcherWithWeakRef} from "../bases/dispatcher.js";

export default class Point extends DispatcherWithWeakRef {
    #x = 0
    #y = 0
    #z = 0
    static count = 0

    constructor(x, y, z = 0) {
        super()
        this.#x = x;
        this.#y = y;
        this.#z = z
        this.id = Point.count++

    }

    move({x, y, z} = {}) {
        if (x) this.#x += x
        if (y) this.#y += y
        if (z) this.#z += z
        this.trigger('change', {key: 'xyz', value: {x, y, z}})
    }

    rotate(angle, origin, pivot = 'z') {
        var xTag = this.#x - origin.x
        var yTag = this.#y - origin.y
        // pivot is z axis
        this.#x = origin.x + xTag * Math.cos(angle) - yTag * Math.sin(angle)
        this.#y = origin.y + xTag * Math.sin(angle) + yTag * Math.cos(angle)

    }

    set x(v) {
        this.#x = v
        this.trigger('change', {key: 'x', value: v})
    }

    get x() {
        return this.#x
    }

    set y(v) {
        this.#y = v
        this.trigger('change', {key: 'y', value: v})
    }

    get y() {
        return this.#y
    }

    set z(v) {
        this.#z = v
        this.trigger('change', {key: 'z', value: v})
    }

    get z() {
        return this.#z
    }

    toJSON() {
        let {x, y} = this
        return {x, y}
    }

    static load(p) {
        return new Point(p.x, p.y)
    }

    draw(ctx, {size = 18, color = "black", outline = false, fill = false} = {}) {
        const radius = size / 2
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false)
        ctx.fill()

        if (outline) {
            ctx.beginPath()
            ctx.lineWidth = 3
            ctx.strokeStyle = 'red'
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2)
            ctx.stroke()
        }
        if (fill) {
            ctx.beginPath()
            ctx.fillStyle = 'red'
            ctx.arc(this.x, this.y, radius * 0.4, 0, Math.PI * 2)
            ctx.fill()
        }

    }

    equal(p) {
        return p.x === this.x && p.y === this.y
    }

    * [Symbol.iterator]() {
        yield ['x', this.x]
        yield ['y', this.y]
        if (this.z !== 0)
            yield ['z', this.z]
    }

}
