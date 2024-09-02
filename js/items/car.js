import Sensor from "./sensor.js";
import Polygon from "../primitives/polygon.js";
import Point from "../primitives/point.js";
import {closeToZero, reduceToZero} from "../utils/math-utils.js";
import NeuralNetwork from "../items/network.js"
import keyboardControls from "../controles/keyboardControls.js"
import DummyControls from "../controles/dummyControls.js";
import KeyboardControls from "../controles/keyboardControls.js";

const carImg = new Image();
carImg.src = "../car.png"
const resolver = Promise.withResolvers()
carImg.onload = function () {
    resolver.resolve()
}


export default class Car {
    static index = 0

    constructor(x, y, width, height, {
        controlType = 'DUMMY', angle = 0, maxSpeed = 3, color = "blue", label = '',
        acceleration = 0.25, maxReverseSpeed = -1.5, friction = 0.05,

    } = {}) {
        this.id = ++Car.index
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color

        this.type = controlType
        this.control = controlType
        this.controlType = controlType

        this.speed = 0
        this.acceleration = acceleration
        this.maxSpeed = maxSpeed
        this.maxReverseSpeed = maxReverseSpeed
        this.friction = friction
        this.angle = angle
        this.damage = false
        this.label = label
        this.fitness = 0

        this.useBrain = controlType == 'AI'
        this.engine = null

        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this)
        }

        switch (controlType) {
            case 'DUMMY':
                this.controls = new DummyControls()
                break
            case 'AI':
                this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4])
                break
            case 'KEYS':
                this.controls = new KeyboardControls()
                break

        }

        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;

        const maskCtx = this.mask.getContext("2d");
        this.update([], [])

        resolver.promise.then(() => {
            maskCtx.fillStyle = color;
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(carImg, 0, 0, this.width, this.height);
        })


    }

    load(info) {
        this.brain = info.brain
        // this.maxSpeed = info.maxSpeed
        // this.friction = info.friction
        this.control = info.control
        this.acceleration = info.acceleration
        this.sensor.rayCount = info.sensor.rayCount
        this.sensor.raySpread = info.sensor.raySpread
        this.sensor.rayLength = info.sensor.rayLength
        this.sensor.rayOffset = info.sensor.rayOffset
    }

    static load(info, mutation) {
        // info.controlType = info.type
        var {x, y, width, height} = info
        var car = new Car(x, y, width, height, info)
        car.brain = structuredClone(info.brain)
        // if (info.sensor)
        car.sensor = new Sensor(car, {
            rayCount: info.sensor.rayCount,
            raySpread: info.sensor.raySpread,
            rayLength: info.sensor.rayLength,
            rayOffset: info.sensor.rayOffset,
            radius: info.sensor.radius,
        })

        if (mutation)
            NeuralNetwork.mutate(car.brain, mutation);

        return car

    }

    update(roadBorders, traffic) {
        if (this.damage) return false
        if (closeToZero(this.speed) && this.useBrain) setTimeout(_ => {
            if (closeToZero(this.speed))
                this.damage = true
        }, 200)
        this.#move()
        this.fitness += this.speed

        this.polygons = this.#createPolygon()
        this.damage = this.#assessDamage(roadBorders, traffic)
        if (this.damage) {
            this.speed = 0
        }
        if (this.sensor) {
            this.sensor?.update(roadBorders, traffic)

            if (this.useBrain) {
                const offsets = this.sensor.readings.map(s => s == null ? 0 : 1 - s.offset)
                const outputs = NeuralNetwork.feedForward(offsets, this.brain)
                this.controls.forward = outputs[0]
                this.controls.left = outputs[1]
                this.controls.right = outputs[2]
                this.controls.reverse = outputs[3]
            }
        }

        if (this.engine) {
            let percent = Math.abs(this.speed / this.maxSpeed)
            this.engine.setVolume(percent)
            this.engine.setPitch(percent)

        }

        return true
    }

    #assessDamage(roadBorders, traffic) {
        return false
        for (let seg of roadBorders) {
            if (this.polygons.intersectSeg(seg))
                return true
        }
        for (let car of traffic) {
            if (this.polygons.intersectPoly(car.polygons))
                return true
        }
        return false
    }

    #createPolygon() {
        const points = []
        const radius = Math.hypot(this.width, this.height) / 2
        const alpha = Math.atan2(this.width, this.height)
        points.push(new Point(
            this.x - Math.sin(this.angle - alpha) * radius,
            this.y - Math.cos(this.angle - alpha) * radius
        ))
        points.push(new Point(
            this.x - Math.sin(this.angle + alpha) * radius,
            this.y - Math.cos(this.angle + alpha) * radius
        ))
        points.push(new Point(
            this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
            this.y - Math.cos(Math.PI + this.angle - alpha) * radius
        ))
        points.push(new Point(
            this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
            this.y - Math.cos(Math.PI + this.angle + alpha) * radius
        ))

        return new Polygon(points, this.label)
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

        this.speed = reduceToZero(this.speed, this.friction)
        if (this.speed === 0) return

        if (this.controls.tilt) {
            this.angle -= this.controls.tilt * 0.03
        } else {
            const flip = this.speed > 0 ? 1 : -1
            if (this.controls.left) {
                this.angle += 0.03 * flip
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip
            }
        }
        // console.table(this)
        this.x -= Math.sin(this.angle) * this.speed
        this.y -= Math.cos(this.angle) * this.speed
    }

    draw(ctx, {drawSensor = false} = {}) {
        if (!carImg.complete) return
        drawSensor && this.sensor?.draw(ctx)

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);


        if (!this.damage) {
            ctx.drawImage(this.mask,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height);
            ctx.globalCompositeOperation = "multiply";
        }
        ctx.drawImage(carImg,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height);
        ctx.restore();
        // this.polygons.draw(ctx);

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

    // draw(ctx, color = 'black', drawSensor) {
    //     drawSensor && this.sensors?.draw(ctx)
    //
    //     if (this.damage)
    //         ctx.fillStyle = 'gray'
    //     else
    //         ctx.fillStyle = color
    //
    //     let {polygons} = this
    //     ctx.beginPath()
    //     ctx.moveTo(polygons[0].x, polygons[0].y)
    //     for (let i = 1; i < polygons.length; i++) {
    //         ctx.lineTo(polygons[i].x, polygons[i].y)
    //     }
    //     ctx.lineTo(polygons[0].x, polygons[0].y)
    //     ctx.fill()
    //
    //
    // }
}