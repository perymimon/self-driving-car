import Point from "./primitives/point.js";
import Polygon from "./primitives/polygon.js";
import {cross, distance, subtract} from "./utils/algebra-math-utils.js";
import Segment from "./primitives/segment.js";
import Polygone from "./primitives/polygon.js";

export default class Camera {
    constructor({x, y, angle}, range = 1000) {

        this.range = range;
        this.move({x, y, angle});

    }

    move({x, y, angle}) {
        this.x = x;
        this.y = y;
        this.z = -20
        this.angle = angle;
        this.center = new Point(x, y);
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

    draw(ctx) {
        // this.center.draw(ctx, {color: 'red'});
        // this.tip.draw(ctx, {color: 'black'});
        // this.left.draw(ctx, {color: 'green'});
        // this.right.draw(ctx, {color: 'red'});
        this.poly.draw(ctx)


    }

    #projectPoint(ctx, p) {
        let seg = new Segment(this.center, this.tip)
        let {point: p1} = seg.projectPoint(p)
        let crossProduct = cross(subtract(p1, this), subtract(p, this)) //todo: more research
        let x = Math.sign(crossProduct) * distance(p, p1) / distance(this, p1)
        let y = -this.z / distance(this, p1)

        let w2 = ctx.canvas.width / 2
        let h2 = ctx.canvas.height / 2
        let scaler = Math.max(w2, h2)
        return new Point(w2 + x * scaler, h2 + y * scaler)

    }

    #filter(polys) {
        let filteredPolys = []
        for (let poly of polys) {
            if (!this.poly.containsPoly(poly))
                continue
            if (poly.intersectPoly(this.poly)) {
                let copy1 = new Polygon(poly.points)
                let copy2 = new Polygon(this.poly.points)
                Polygone.break(copy1, copy2, true)
                let points = copy1.segments.map(s=> s.p1)
                    .filter(p => p.intersection || this.poly.containsPoint(p))
                filteredPolys.push(new Polygone(points))
            } else {
                filteredPolys.push(poly)
            }

        }
        return filteredPolys
    }

    render(ctx, world) {
        const polys = this.#filter(world.buildings.map(b => b.base))

        var projPolys = polys.map(
            poly => new Polygon(
                poly.points.map(p => this.#projectPoint(ctx, p))
            )
        )
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        for (let poly of projPolys) {
            poly.draw(ctx)
        }
        // for (let poly of polys){
        //     poly.draw(ctx)
        // }

    }
}