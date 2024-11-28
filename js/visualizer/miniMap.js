import Point from "../primitives/point.js";
import {scale} from "../utils/algebra-math-utils.js";
import {drawCircle, getProperty} from "../utils/canvas-utils.js";

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

        var colorRoad = getProperty(ctx, '--color-minimap-road')
        for (let seg of this.graph.segments) {
            seg.draw(ctx, {width: 4 / scalar, color: colorRoad})
        }

        var colorCar = getProperty(ctx, '--color-minimap-car')
        var colorCarDamage = getProperty(ctx, '--color-minimap-car-damage')
        for (let car of cars) {
            let fill = colorCar
            if(car.damage) fill = colorCarDamage
            drawCircle(ctx, car.x, car.y, 5 / scalar, {fill})
        }


        ctx.restore()
    }
}