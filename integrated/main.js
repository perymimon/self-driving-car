import Graph from '../world-editor/js/math/graph.js'
import ViewPort from "../world-editor/js/viewport.js";
import World from "../world-editor/js/world.js"
import {angle, scale} from "../world-editor/js/math/utils.js";
import Start from "../world-editor/js/markings/start.js";
import Point from "../world-editor/js/primitives/point.js";

const carCanvas = document.querySelector('#carCanvas');
carCanvas.width = window.innerWidth - 300;
carCanvas.height = window.innerHeight;

const networkCanvas = document.querySelector('#networkCanvas');
networkCanvas.width = 300;
networkCanvas.height = window.innerHeight;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');


const worldString = localStorage.getItem('world')
const worldInfo = worldString ? JSON.parse(worldString) : null
const world = worldInfo ? World.Load(worldInfo) : new World(new Graph())
const viewPort = new ViewPort(carCanvas, world.zoom, world.offset)

const N = 100
const cars = generateCars(N)
var bestCar = cars[0]
var goodCars = [...cars]

if (localStorage.getItem('bestBrain')) {
    let bestBrain = JSON.parse(localStorage.getItem('bestBrain'));
    for (let car of cars) {
        let brain = structuredClone(bestBrain)
        car.brain = NeuralNetwork.mutate(brain, 0.1);
    }
    cars[0].brain = bestBrain
}


var traffic = []
var roadBorders = world.roadBorders
    // .map(b => b.base.segments)
    // .flat()
    .map(s => [s.p1, s.p2])

animate()

function generateCars(N) {
    const start = world.markings.filter(m => m instanceof Start).at(0)
    let point = start?.center ?? new Point(100, 100)
    let dir = start.directionVector ?? new Point(0, -1)
    return Array.from(Array(N), i => new Car(point.x, point.y, 30, 50, "AI", 4, Math.PI / 2 - angle(dir)))
}

function save() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

function discard() {
    localStorage.removeItem('bestBrain')
}

function animate(time) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let car of traffic) {
        car.update(roadBorders, [])
    }
    let max = Math.max(...cars.map(c => c.fitness))
    bestCar = cars.find(c => c.fitness == max)

    // let farestCar = goodCars.reduce((best, car) => best.y > car.y ? car : best)
    for (let car of goodCars) {
        // if (Math.abs(farestCar.y - car.y) > carCanvas.height) {
        //     car.damage = true
        // } else {
        car.update(roadBorders, traffic)
        // }
    }
    goodCars = goodCars.filter(car => !car.damage)

    viewPort.offset.x = -bestCar.x
    viewPort.offset.y = -bestCar.y

    viewPort.reset()
    let viewPoint = scale(viewPort.getOffset(), -1)

    world.draw(carCtx, viewPoint, false)

    for (let car of traffic) {
        car.draw(carCtx, 'red')
    }

    world.cars = cars
    world.bestCar = bestCar

    carCtx.restore()

    networkCtx.lineDashOffset = -time / 50

    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height)
    Visualizer.drawNetwork(networkCtx, bestCar.brain)
    requestAnimationFrame(animate)
}