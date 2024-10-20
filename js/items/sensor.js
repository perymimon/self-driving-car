import Segment from "../primitives/segment.js";
import Region from "../math/region.js";
import {lerp} from "../utils/algebra-math-utils.js"
export default class Sensor {
    constructor(car, {
        rayCount = 6, rayLength = 150,
        raySpread = Math.PI / 2, rayOffset = 0
    } = {}) {
        this.car = car
        this.rayCount = rayCount
        this.rayLength = rayLength
        this.raySpread = raySpread
        this.rayOffset = rayOffset

        this.rays = []
        this.readings = []
        this.region = new Region(this.car, this.rayLength * 3, this.rayLength)
        this.bordersRegion = null
    }

    update(roadBorders, traffic) {
        let {region} = this
        if (region.update(this.car) || !this.bordersRegion) {
            this.bordersRegion = roadBorders.filter(seg =>
                region.inside(seg.p1) || region.inside(seg.p2)
            )
        }
        this.#castRays()
        this.readings = []
        for (let ray of this.rays) {
            this.readings.push(
                this.#getReading(ray, this.bordersRegion, traffic)
            )
        }
    }

    #getReading(ray, roadBorders, traffic) {
        let touches = []
        for (let border of roadBorders) {
            // const touche = getIntersection(ray[0], ray[1], border[0], border[1])
            let touche = ray.intersection(border)
            if (!touche) continue
            touches.push(touche)
        }

        for (let car of traffic) {
            let touch = car.polygons.intersectSeg(ray)
            if (touch) touches.push(touch)
        }

        if (touches.length == 0) return null
        touches.sort((a, b) => a.offset - b.offset)
        return touches[0]
    }

    #castRays() {
        this.rays = []

        for (let i = 0; i < this.rayCount; i++) {
            let {raySpread, rayLength} = this
            let rayAngle = lerp(raySpread / 2, -raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
            )
            rayAngle += this.car.angle
            rayAngle += this.rayOffset
            const start = {x: this.car.x, y: this.car.y}
            const end = {
                x: this.car.x - Math.sin(rayAngle) * rayLength,
                y: this.car.y - Math.cos(rayAngle) * rayLength
            }
            this.rays.push(new Segment(start, end))
        }

    }

    draw(ctx) {
        ctx.save()
        for (let [i, ray] of this.rays.entries()) {
            let read = this.readings[i]
            let end = read ? read : ray.p2

            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.strokeStyle = 'yellow'
            ctx.moveTo(ray.p1.x, ray.p1.y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()

            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.strokeStyle = 'gray'
            ctx.moveTo(ray.p2.x, ray.p2.y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()
        }
        ctx.restore()
    }
}