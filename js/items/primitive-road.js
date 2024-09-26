import Segment from "../primitives/segment.js";
import Point from "../primitives/point.js";
import {lerp} from "../utils/algebra-math-utils.js"

export default class PrimitiveRoad {
    constructor(x, width, laneCount = 3) {
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - this.width / 2
        this.right = x + this.width / 2


        const infinity = 10_000_000
        this.top = -infinity
        this.bottom = infinity
        const topLeft = new Point(this.left, this.top)
        const topRight = new Point(this.right, this.top)
        const bottomLeft = new Point(this.left, this.bottom)
        const bottomRight = new Point(this.right, this.bottom)

        this.borders = [
            new Segment(topLeft, bottomLeft),
            new Segment(topRight, bottomRight)
        ]
    }

    getLaneCenter(laneIndex) {
        laneIndex = Math.min(laneIndex, this.laneCount - 1)
        const laneWidth = this.width / this.laneCount
        return this.left + laneWidth / 2 + laneWidth * laneIndex
    }

    draw(ctx) {
        ctx.lineWidth = 5
        ctx.strokeStyle = "white"
        for (let i = 1; i < this.laneCount; i++) {
            const x = lerp(this.left, this.right, i / this.laneCount)
            ctx.setLineDash([20, 20])
            ctx.beginPath()
            ctx.moveTo(x, this.top)
            ctx.lineTo(x, this.bottom)
            ctx.stroke()
        }

        for (let border of this.borders) {
            border.draw(ctx, {dash: []})
            // ctx.setLineDash([])
            // ctx.beginPath()
            // ctx.moveTo(border[0].x, border[0].y)
            // ctx.lineTo(border[1].x, border[1].y)
            // ctx.stroke()
        }
    }
}

