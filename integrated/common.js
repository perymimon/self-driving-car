import Start from "../js/editors/markings/start.js";
import Point from "../js/primitives/point.js";
import Car from "../js/items/car.js";
import {angle} from "../js/utils/algebra-math-utils.js";
import World from "../js/world.js";
import Graph from "../js/math/graph.js";
import ViewPort from "../js/viewport.js";
import MiniMap from "../js/visualizer/miniMap.js";
import {fetchLastFile} from "../js/utils/codeflow-utils.js";

export function canvastion(selector, width, height) {
    const canvas = document.querySelector(selector)
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    return [canvas, ctx]
}

export const [carCanvas, carCtx] = canvasion('#carCanvas', window.innerWidth, window.innerHeight);

var worldJson = await fetchLastFile('world', './saved/small_with_target.world')
export var world = World.Load(worldJson) ?? new World(new Graph())
export var moldCar = await fetchLastFile('car', './saved/right_hand_rule.car')
export var viewPort = new ViewPort(carCanvas, 1, world.offset)

export const [miniMapCanvas]
    = canvasion('#miniMapCanvas', 300, 300);

export var miniMap = new MiniMap(miniMapCanvas, world.graph, 300)

export function generateCars(N = 1, type = 'AI', mutation = 0) {
    const starts = world.markings.filter(m => m instanceof Start)
    let start = starts.at(0)
    let point = start?.center ?? new Point(100, 100)
    let dir = start?.directionVector ?? new Point(0, -1)
    return Array.from({length: Number(N)}, (_, i) => {

            var brain = JSON.parse(localStorage.getItem('bestBrain'))
            return Car.load({
                ...moldCar,
                brain: brain ?? moldCar.brain,
                x: point.x,
                y: point.y,
                width: 30,
                height: 50,
                controlType: type,
                angle: Math.PI / 2 - angle(dir),
                maxSpeed: 4,
                color: "red",
                label: String(i)
            }, i == 0 ? 0 : mutation)

        }
    )
}

