class Car {
    constructor(x, y, width, height, control, maxSpeed = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0
        this.acceleration = 0.2
        this.maxSpeed = maxSpeed
        this.maxReverseSpeed = -1.5
        this.friction = 0.05
        this.angle = 0
        this.damage = false
        this.control = control

        this.useBrain = control == 'AI'

        if (control != "DUMMY") {
            this.sensors = new Sensor(this)
            this.brain = new NeuralNetwork([
                this.sensors.rayCount, 6, 4
            ])
        }
        this.controls = new Controls(this.control)

    }

    update(roadBorders, traffic) {
        if (this.damage) return false

        this.#move()
        this.polygons = this.#createPolygon()
        this.damage = this.#assessDamage(roadBorders, traffic)

        if (this.sensors) {
            this.sensors?.update(roadBorders, traffic)

            if (this.useBrain) {
                const offsets = this.sensors.readings.map(s => s == null ? 0 : 1 - s.offset)
                const outputs = NeuralNetwork.feedForward(offsets, this.brain)
                this.controls.forward = outputs[0]
                this.controls.left = outputs[1]
                this.controls.right = outputs[2]
                this.controls.reverse = outputs[3]
            }
        }
        return true
    }

    #assessDamage(roadBorders, traffic) {
        for (let border of roadBorders) {
            if (polysIntersect(this.polygons, border))
                return true
        }
        for (let car of traffic) {
            if (polysIntersect(this.polygons, car.polygons))
                return true
        }
        return false
    }

    #createPolygon() {
        const points = []
        const radius = Math.hypot(this.width, this.height) / 2
        const alpha = Math.atan2(this.width, this.height)
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * radius,
            y: this.y - Math.cos(this.angle - alpha) * radius
        })
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * radius,
            y: this.y - Math.cos(this.angle + alpha) * radius
        })
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius
        })
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius
        })

        return points
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration
        }
        this.speed = Math.min(this.speed, this.maxSpeed)
        this.speed = Math.max(this.speed, this.maxReverseSpeed)

        this.speed = Math.sign(this.speed) * (Math.abs(this.speed) - this.friction)
        if (Math.abs(this.speed) < this.friction)
            this.speed = 0;
        if (this.speed === 0) return

        const flip = this.speed > 0 ? 1 : -1
        if (this.controls.left) {
            this.angle += 0.02 * flip
        }
        if (this.controls.right) {
            this.angle -= 0.02 * flip
        }
        // console.table(this)
        this.x -= Math.sin(this.angle) * this.speed
        this.y -= Math.cos(this.angle) * this.speed
    }

    // draw(ctx) {
    //     ctx.save()
    //     ctx.translate(this.x, this.y)
    //     ctx.rotate(-this.angle)
    //
    //     ctx.beginPath()
    //     ctx.rect(
    //         -this.width / 2,
    //         -this.height / 2,
    //         this.width,
    //         this.height
    //     )
    //     ctx.fill();
    //
    //     ctx.restore()
    //
    //     this.sensors.draw(ctx)
    // }

    draw(ctx, color = 'black', drawSensor) {
        drawSensor && this.sensors?.draw(ctx)

        if (this.damage)
            ctx.fillStyle = 'gray'
        else
            ctx.fillStyle = color

        let {polygons} = this
        ctx.beginPath()
        ctx.moveTo(polygons[0].x, polygons[0].y)
        for (let i = 1; i < polygons.length; i++) {
            ctx.lineTo(polygons[i].x, polygons[i].y)
        }
        ctx.lineTo(polygons[0].x, polygons[0].y)
        ctx.fill()


    }
}