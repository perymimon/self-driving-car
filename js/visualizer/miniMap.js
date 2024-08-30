import {scale} from "../utils/algebra-math-utils.js";
import Point from "../primitives/point.js";

export default class MiniMap {
    constructor(canvas, graph, size) {
        this.canvas = canvas;
        this.graph = graph;
        this.size = size;

        canvas.width = size;
        canvas.height = size;
        this.ctx = this.canvas.getContext('2d');
    }

    update(viewPort, cars = []) {
        let {ctx, canvas, size} = this
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let scaler = 0.1
        let offset = scale(viewPort.getOffset(), scaler)
        // let viewPoint = scale(offset, scaler)
        ctx.save()
        ctx.translate(
            offset.x + size / 2,
            offset.y + size / 2
        );
        ctx.scale(scaler, scaler);
        for (let seg of this.graph.segments) {
            seg.draw(ctx, {width: 5 / scaler, color: 'white'})
        }
        for (let car of cars) {
            if(car.damage) continue
            new Point(car.x, car.y).draw(ctx, {color: 'red'});
        }

        ctx.restore()
    }
}