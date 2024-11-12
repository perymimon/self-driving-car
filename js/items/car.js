import BrainControls from "../controls/brainControls.js";
import DummyControls from "../controls/dummyControls.js";
import NeuralNetwork from "../math/network.js"
import Point from "../primitives/point.js";
import Polygon from "../primitives/polygon.js";
import Segment from "../primitives/segment.js";
import {getNearestSegment, magnitude, normalize, subtract} from "../utils/algebra-math-utils.js";
import {getMaxItem, TrackCounter} from "../utils/codeflow-utils.js";
import {clap, isCloseZero, reduceToZero} from "../utils/math-utils.js";
import Sensor from "./sensor.js";
import SensorCompass from "./sensorCompass.js";

const carImg = new Image();
carImg.src = "../../assets/car.png"
const resolver = Promise.withResolvers()
carImg.onload = function () {
    resolver.resolve()
}


export default class Car {
    static index = 0

    constructor(x, y, width, height, {
        type, angle = 0, maxSpeed = 2, color = "blue", label = '',
        acceleration = 0.2, maxReverseSpeed = -1.5, friction = 0.05,
        brain, mutation = 0.1,
        noDamage = false
    } = {}) {
        this.id = ++Car.index
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color

        // this.controlType = controlType
        this.type = type

        this.speed = 0
        this.acceleration = acceleration
        this.maxSpeed = maxSpeed
        this.maxReverseSpeed = maxReverseSpeed
        this.friction = friction
        this.angle = angle
        this.damage = false
        this.label = label
        this.fitness = 0
        this.noDamageMode = noDamage

        this.useBrain = ['AI', 'KEYS'].includes(type)

        this.engine = null
        this.progress = 0;

        this.polygons = this.#createPolygon()

        switch (type) {
            case 'DUMMY':
                this.controls = new DummyControls()
                break
            case 'AI':
            case 'KEYS':
                this.sensor = new Sensor(this, {
                    rayCount: 6, rayLength: 150,
                    raySpread: Math.PI / 2, rayOffset: 0
                })
                this.sensorPathCompass = new SensorCompass(this)
                const sensors = [this.sensor, this.sensorPathCompass]
                this.controls = new BrainControls(sensors, brain, brain ? mutation : 0)
                if (type == 'KEYS')
                    this.controls.gear('manual')
                break
            // case 'CAMERA':
            //     this.controls

        }

        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;

        // document.getElementById('maskArea').appendChild(this.mask);

        this.update([], [])
        this.setColor(color)


    }

    * [Symbol.iterator]() {
        for (let [key, value] of Object.entries(this)) {
            if (value == null) continue
            yield [key, value]
        }
    }

    setColor(color) {
        const maskCtx = this.mask.getContext("2d");
        this.color = color
        resolver.promise.then(() => {
            maskCtx.drawImage(carImg, 0, 0, this.width, this.height);
            maskCtx.globalCompositeOperation = "source-in";

            maskCtx.fillStyle = color;
            maskCtx.fillRect(0, 0, this.width, this.height);


        })
    }

    load(info) {
        this.brain = info.brain
        // this.maxSpeed = info.maxSpeed
        // this.friction = info.friction
        this.type = info.control
        this.acceleration = info.acceleration
        this.sensor.rayCount = info.sensor.rayCount
        this.sensor.raySpread = info.sensor.raySpread
        this.sensor.rayLength = info.sensor.rayLength
        this.sensor.rayOffset = info.sensor.rayOffset
    }

    static load(info, mutation) {
        var {x, y, width, height} = info
        var car = new Car(x, y, width, height, info)
        if (info.sensor)
            car.sensor = new Sensor(car, {
                rayCount: info.sensor.rayCount,
                raySpread: info.sensor.raySpread,
                rayLength: info.sensor.rayLength,
                rayOffset: info.sensor.rayOffset,
                radius: info.sensor.radius,
            })
        if (info.brain) {
            let brain = structuredClone(info.brain)
            if (mutation)
                brain = NeuralNetwork.mutate(brain, mutation)
            car.controls.brain = brain
        }

        return car

    }

    #bounceCar(roadBorders) {
        var seg = getNearestSegment(this, roadBorders)
        var correctors = this.polygons.points.map(p => {
            let {point: projPoint} = seg.projectPoint(p)
            return subtract(projPoint, p)
        })
        var corrector = getMaxItem(correctors, p => magnitude(p))
        var normCorrector = normalize(corrector)

        this.x -= normCorrector.x
        this.y -= normCorrector.y

        if ([correctors[0], correctors[2]].includes(corrector)) {
            this.angle += 0.1
        } else {
            this.angle -= 0.1
        }
    }

    trackStopped = new TrackCounter(60)

    update(roadBorders, traffic = [], pathTracking = []) {
        if (this.damage) return false

        if (this.sensor && this.useBrain) {
            this.sensor.update(roadBorders, traffic)
            this.sensorPathCompass.update(pathTracking)
            this.controls.update()
        }

        this.#move()

        if (pathTracking) {
            let segmentsDone = this.#updateProgress(pathTracking)
            this.fitness = segmentsDone.reduce((acc, b) => acc + b.length(), 0)
        } else {
            this.fitness += this.speed
        }

        this.damage = this.#assessDamage(roadBorders, traffic)
        if (this.damage && this.noDamageMode == true) {
            this.#bounceCar(roadBorders)
            this.damage = false
        }
        if (this.damage) {
            this.speed = 0
        }
        // if car not move for X frame it consider damaged
        if (!this.damage && this.type === 'AI')
            // Is it consistently positive?
            if (this.trackStopped.trackDown(isCloseZero(this.speed) && this.useBrain))
                this.damage = true


        if (this.engine) {
            let percent = Math.abs(this.speed / this.maxSpeed)
            this.engine
                .setVolume(percent)

            this.engine
                .setPitch(percent)
        }

        return true
    }

    #updateProgress(segments) {
        let dones = []
        let carSeg = getNearestSegment(this, segments)
        for (let seg of segments) {
            if (seg == carSeg) {
                let proj = seg.projectPoint(this)
                let partSeg = new Segment(seg.p1, proj.point)
                dones.push(partSeg)
                break
            } else {
                dones.push(seg)
            }
        }
        return dones


    }

    #assessDamage(roadBorders, traffic) {
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
        if (!this.controls) return new Point(0, 0)

        if (this.controls.forward) {
            this.speed += this.acceleration
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration
        }

        this.speed = clap(this.speed, this.maxReverseSpeed, this.maxSpeed)

        this.speed = reduceToZero(this.speed, this.friction)
        if (this.speed === 0) return new Point(0, 0)

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
        let {x, y} = this
        this.x -= Math.sin(this.angle) * this.speed
        this.y -= Math.cos(this.angle) * this.speed
        var positionPoint = subtract(this, {x, y})
        this.polygons.move(positionPoint)
        return positionPoint
    }

    draw(ctx, {drawSensor = false, color} = {}) {
        if (!carImg.complete) return
        if (color && this.color != color) {
            this.setColor(color)
        }
        drawSensor && this.sensor?.draw(ctx)
        drawSensor && this.sensorPathCompass?.draw(ctx)

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

}