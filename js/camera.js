import Point from "./primitives/point.js";
import Polygon from "./primitives/polygon.js";
import Polygone from "./primitives/polygon.js";
import {
    angle2P,
    average,
    cross,
    degToRad,
    distance,
    inward,
    lerp,
    subtract,
    translate, vector3d
} from "./utils/algebra-math-utils.js";
import Segment from "./primitives/segment.js";
import {extrude, generateFaces} from "./utils/3d-utils.js";

export default class Camera {
    constructor(car, range = 1500, distanceBehind = 80) {
        let {x, y, angle, speed = 0, maxSpeed = 3} = car
        angle += degToRad(-60);
        this.range = range;
        this.distanceBehind = distanceBehind;
        this.x = x + this.distanceBehind * Math.sin(angle)
        this.y = y + this.distanceBehind * Math.cos(angle)
        this.angle = angle
        this.move(car);

    }

    move({x, y, angle, speed, maxSpeed}) {
        let t = 0.15
        // let t = 0.0001
        this.x ??= x
        this.y ??= y
        this.z ??= -30 - (10 * speed / maxSpeed)
        this.x = lerp(this.x, x + this.distanceBehind * Math.sin(angle), t)
        this.y = lerp(this.y, y + this.distanceBehind * Math.cos(angle), t)
        // this.z = lerp(this.z , -30 + speed *2* Math.random(),0.05)
        this.angle = lerp(this.angle ?? angle, angle, t)
        this.center = new Point(this.x, this.y);
        this.tip = new Point(//todo: need to research it more
            this.x - this.range * Math.sin(this.angle),
            this.y - this.range * Math.cos(this.angle),
        )
        this.left = new Point(//todo: need to research it more
            this.x - this.range * Math.sin(this.angle - Math.PI / 4),
            this.y - this.range * Math.cos(this.angle - Math.PI / 4),
        )
        this.right = new Point(
            this.x - this.range * Math.sin(this.angle + Math.PI / 4),
            this.y - this.range * Math.cos(this.angle + Math.PI / 4),
        )

        this.poly = new Polygon([
            this.center, this.left, this.right
        ])
    }

    moveSimple({x, y, angle}) {
        this.x = x + this.distanceBehind * Math.sin(angle);
        this.y = y + this.distanceBehind * Math.cos(angle)
        this.z = -30
        this.angle = angle;
        this.center = new Point(this.x, this.y);
        this.tip = new Point(//todo: need to research it more
            this.x - this.range * Math.sin(this.angle),
            this.y - this.range * Math.cos(this.angle),
        )
        this.left = new Point(//todo: need to research it more
            this.x - this.range * Math.sin(this.angle - Math.PI / 4),
            this.y - this.range * Math.cos(this.angle - Math.PI / 4),
        )
        this.right = new Point(
            this.x - this.range * Math.sin(this.angle + Math.PI / 4),
            this.y - this.range * Math.cos(this.angle + Math.PI / 4),
        )

        this.poly = new Polygon([
            this.center, this.left, this.right
        ])
    }


    #projectPoint(ctx, p) {
        let seg = new Segment(this.center, this.tip)
        let {point: p1} = seg.projectPoint(p)
        let c = cross(subtract(p1, this), subtract(p, this)) //todo: more research
        let x = Math.sign(c) * (distance(p, p1) / distance(this, p1))
        let y = (p.z - this.z) / distance(this, p1)

        let w2 = ctx.canvas.width / 2
        let h2 = ctx.canvas.height / 2
        let scaler = Math.max(w2, h2)
        return new Point(w2 + x * scaler, h2 + y * scaler)

    }

    #filter(polys) {
        let filteredPolys = []
        for (let poly of polys) {
            if (poly.intersectPoly(this.poly)) {
                let copy1 = new Polygon(poly.points)
                let copy2 = new Polygon(this.poly.points)
                Polygone.break(copy1, copy2, true)
                let points = copy1.segments.map(s => s.p1)
                    .filter(p => p.intersection || this.poly.containsPoint(p))
                filteredPolys.push(new Polygone(points))
            } else if (this.poly.containsPoly(poly)) {
                filteredPolys.push(poly)
            }

        }
        return filteredPolys
    }

    #extrude(polys, height = 10) {
        let extrudedPolys = []
        for (let poly of polys) {
            let ceiling = new Polygon(poly.points.map(p => new Point(p.x, p.y, -height)))
            let sides = []
            for (let i of poly.points.keys()) {
                let nextI = (i + 1) % poly.points.length
                sides.push(new Polygon([
                    poly.points[i],
                    poly.points[nextI],
                    ceiling.points[nextI],
                    ceiling.points[i]
                ]))
            }
            extrudedPolys.push(...sides, ceiling)
        }
        return extrudedPolys
    }

    #filterExtrude(polyes, height) {
        let filtered = this.#filter(polyes)
        let extruded = this.#extrude(filtered, height)
        return extruded
    }

    #extrudeCar(car, height = 10, wheelRadius = 5) {
        var [frontRight, frontLeft, backLeft, backRight] = car.polygons.points
        var middleLeft = average(frontLeft, backLeft)
        var middleRight = average(frontRight, backRight)
        var quarterFrontLeft = average(frontLeft, middleLeft)
        var quarterFrontRight = average(frontRight, middleRight)
        var quarterBackLeft = average(backLeft, middleLeft)
        var quarterBackRight = average(backRight, middleRight)

        inward(frontLeft, frontRight, .3)
        inward(quarterFrontLeft, quarterFrontRight, .05)
        inward(backLeft, backRight, .2)


        var base = new Polygon([
            frontLeft, quarterFrontLeft, middleLeft, quarterBackLeft, backLeft,
            backRight, quarterBackRight, middleRight, quarterFrontRight, frontRight
        ])
            .translate(p => (p.z = -wheelRadius, p))
        var ceiling = base.clone(p => new Point(p.x, p.y, -height - wheelRadius))

        var midLine = base.clone(p => new Point(p.x, p.y, (-height * 2 / 5 - wheelRadius)))

        let [c_frontLeft, c_quarterFrontLeft, c_middleLeft, c_quarterBackLeft, c_backLeft,
            c_backRight, c_quarterBackRight, c_middleRight, c_quarterFrontRight, c_frontRight] = ceiling.points

        c_frontLeft.z = c_frontRight.z += 4
        c_quarterFrontLeft.z = c_quarterFrontRight.z += 3
        c_backRight.z = c_backLeft.z += 3

        /*ceiling parts*/
        var front = new Polygon([
            c_frontLeft, c_quarterFrontLeft,
            c_quarterFrontRight, c_frontRight
        ])
        var frontMiddle = new Polygon([
            c_quarterFrontLeft, c_middleLeft,
            c_middleRight, c_quarterFrontRight,
        ])
        var middle = new Polygon([
            c_middleLeft, c_quarterBackLeft,
            c_quarterBackRight, c_middleRight,
        ])
        var rear = new Polygon([
            c_quarterBackLeft, c_backLeft,
            c_backRight, c_quarterBackRight,
        ])
        var ceilingParts = [front, frontMiddle, middle, rear]

        inward(c_frontLeft, c_frontRight)
        inward(c_quarterFrontLeft, c_quarterFrontRight)
        inward(c_middleLeft, c_middleRight, .2)
        inward(c_quarterBackRight, c_quarterBackLeft, .2)
        inward(c_backLeft, c_backRight, .1)

        inward(c_frontLeft, c_backLeft, .1)
        inward(c_frontRight, c_backRight, .1)


        var sides = []
        var len = base.points.length
        for (let i = 0; i < len; i++) {
            sides.push(new Polygone([
                base.points[i],
                base.points[(i + 1) % len],
                midLine.points[(i + 1) % len],
                midLine.points[i],
            ]))
        }
        for (let i = 0; i < len; i++) {
            sides.push(new Polygone([
                midLine.points[i],
                midLine.points[(i + 1) % len],
                ceiling.points[(i + 1) % len],
                ceiling.points[i],
            ]))
        }
        var carAngle = angle2P(frontLeft, backLeft)
        var wheel1 = this.#generateWheel(quarterFrontLeft, wheelRadius, carAngle, car.fitness)
        var wheel2 = this.#generateWheel(quarterFrontRight, wheelRadius, carAngle, car.fitness)
        var wheel3 = this.#generateWheel(quarterBackLeft, wheelRadius, carAngle, car.fitness)
        var wheel4 = this.#generateWheel(quarterBackRight, wheelRadius, carAngle, car.fitness)
        return [...sides, ...ceilingParts, ...wheel1, ...wheel2, ...wheel3, ...wheel4 ]
    }

    #generateWheel(center, radius, angle, distance = 0, thickness = 4) {
        var center1 = translate(center, angle + degToRad(90), thickness / 2)
        var side = this.#generateSideWheel(center1, radius, angle, distance)
        return extrude(side, vector3d(angle-degToRad(90), 0 ,thickness))
    }

    #generateSideWheel(center, radius, angle, distance = 0) {
        var support = [center, translate(center, angle, radius)]
        var points = []
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            let aa = a + distance / 8
            let point = new Point(
                lerp(support[0].x, support[1].x, Math.cos(aa)),
                lerp(support[0].y, support[1].y, Math.cos(aa)),
                center.z + Math.sin(aa) * radius
            )
            points.push(point)
        }
        return new Polygon(points)
    }

    render(ctx, world, carCtx) {
        const buildings = this.#filterExtrude(world.buildings.map(b => b.base), 200)
        // const trees = this.#filterExtrude(world.trees.map(tree => tree.base), 60, {color: 'green'})
        const bestCar = this.#extrudeCar(world.bestCar, 10)

        const roadPolys = world.corridor.borders.map((seg, i) => {
            return new Polygon([seg.p2, seg.p1], i)
        })
        const carsShadow = this.#filter(world.cars.map(car => car.polygons))

        for (let poly of carsShadow) {
            poly.fill = "rgba(150,150,150,1)"
            poly.stroke = "rgba(0,0,0,0)"
            this.dist = poly.distanceToPoint(this)
            // poly.label = this.dist.toFixed(0)
        }
        for (let poly of buildings) {
            poly.fill = "rgba(150,150,150,.5)"
            poly.stroke = "rgba(150,150,150,1)"
            poly.dist = poly.distanceToPoint(this)
            // poly.label = this.dist.toFixed(0)
        }
        const roads = this.#filterExtrude(roadPolys, 10)

        var polys = [...buildings, ...carsShadow, ...bestCar,  /*...trees,*/ ...roads]
        // var polys = carsShadow

        var projectedPolys = polys.map(
            poly => poly.clone(p => this.#projectPoint(ctx, p))
        )
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        const x = this.x, y = this.y;
        for (let [i, poly] of projectedPolys.entries()) {
            let {fill, stroke, dist = 0} = polys[i]
            ctx.globalAlpha = (1 - dist / this.range) ** 2
            poly.draw(ctx, {fill, stroke, join: "round"})
            // ctx.globalAlpha = 1
        }


    }

    draw(ctx) {
        // this.center.draw(ctx, {color: 'red'});
        // this.tip.draw(ctx, {color: 'black'});
        // this.left.draw(ctx, {color: 'green'});
        // this.right.draw(ctx, {color: 'red'});
        this.poly.draw(ctx)


    }

}