import Segment from "../primitives/segment.js";
import {add, lerp, lerp2D, pseudoRandom, scale, subtract, translate} from "../math/utils.js";
import Polygon from "../primitives/polygon.js";
import Point from "../primitives/point.js";

export default class Tree {
    heightCoef = 0.2
    levelCount = 7

    constructor(center, size) {
        this.center = center;
        this.size = size; // size of the base
        this.base = this.#generateLevel(center, size)
    }

    draw(ctx, viewPoint) {
        const diff = subtract(this.center, viewPoint);
        const top = add(this.center, scale(diff, this.heightCoef))

        for (let i = 0; i < this.levelCount; i++) {
            let t = i / (this.levelCount);
            let point = lerp2D(this.center, top, t);
            let color = `rgb(30,${lerp(50, 200, t)},70)`
            let size = lerp(this.size, this.size / 4, t)
            let poly = this.#generateLevel(point, size, i)
            poly.draw(ctx, {fill: color, stroke: '#0000'});
        }

    }

    #generateLevel(point, size) {
        let points = []
        let pointCount = 16;
        size /=2
        for (let a = 0; a < 2 * Math.PI; a += Math.PI / pointCount) {
            let sid = a + this.center.x + size
            let radius = size * lerp(0.5, 1, pseudoRandom(sid))
            points.push(translate(point, a, radius))
        }

        return new Polygon(points)

    }
}