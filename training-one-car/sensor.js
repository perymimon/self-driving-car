class Sensor {
    constructor(car) {
        this.car = car
        this.rayCount = 6
        this.rayLength = 150
        this.raySpread = Math.PI / 2

        this.rays = []
        this.readings = []
    }

    update(roadBorders, traffic) {
        this.#castRays()
        this.readings = []
        for (let ray of this.rays) {
            this.readings.push(
                this.#getReading(ray, roadBorders, traffic)
            )
        }
    }

    #getReading(ray, roadBorders, traffic) {
        let touches = []
        for (let border of roadBorders) {
            const touche = getIntersection(ray[0], ray[1], border[0], border[1])
            if (!touche) continue
            touches.push(touche)
        }

        for (let car of traffic) {
            let {polygons} = car
            for (let [i, point] of polygons.entries()) {
                const touche = getIntersection(ray[0], ray[1], point, polygons[(i + 1) % polygons.length])
                if (!touche) continue
                touches.push(touche)
            }
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
            const start = {x: this.car.x, y: this.car.y}
            const end = {
                x: this.car.x - Math.sin(rayAngle) * rayLength,
                y: this.car.y - Math.cos(rayAngle) * rayLength
            }
            this.rays.push([start, end])
        }

    }

    draw(ctx) {
        ctx.save()
        for (let [i, ray] of this.rays.entries()) {
            let end = ray[1]
            if (this.readings[i])
                end = this.readings[i]

            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.strokeStyle = 'yellow'
            ctx.moveTo(ray[0].x, ray[0].y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()

            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.strokeStyle = 'gray'
            ctx.moveTo(ray[1].x, ray[1].y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()
        }
        ctx.restore()
    }
}