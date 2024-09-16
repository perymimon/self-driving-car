import {scale} from "../utils/algebra-math-utils.js";
import Point from "../primitives/point.js";

export default class MiniMap {
    constructor(canvas, graph, size, cars) {
        this.canvas = canvas;
        this.graph = graph;
        this.cars = cars;
        this.size = size;

        canvas.width = size;
        canvas.height = size;
        this.ctx = this.canvas.getContext('2d');
    }

    update(viewPort, cars = []) {
        let {ctx, canvas, size} = this
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let scalar = 0.1
        let offset = scale(viewPort.getOffset(), scalar)
        // let viewPoint = scale(offset, scalar)
        ctx.save()
        ctx.translate(
            offset.x + size / 2,
            offset.y + size / 2
        );
        ctx.scale(scalar, scalar);
        for (let seg of this.graph.segments) {
            seg.draw(ctx, {width: 4 / scalar, color: 'white'})
        }
        for (let car of cars) {
            this.ctx.beginPath()
            this.ctx.arc(car.x, car.y, 5 / scalar, 0, Math.PI * 2)
            this.ctx.fill()
        }
        for (let car of cars) {
            if (car.damage) continue
            new Point(car.x, car.y).draw(ctx, {color: 'red'});
        }

        ctx.restore()
    }
}