import Graph from '../js/math/graph.js'
import ViewPort from "../js/viewport.js";
import World from "../js/world.js"
import {angle} from "../js/utils/math-utils.js";
import Start from "../js/markings/start.js";
import Point from "../js/primitives/point.js";
import MiniMap from "../js/visualizer/miniMap.js"
import Car from "../js/items/car.js"
import {loadJsonFile} from "./operationUtil.js";

const N = 1
const mutate = 0.2




const carCanvas = document.querySelector('#carCanvas');
carCanvas.width = window.innerWidth;
carCanvas.height = window.innerHeight;

const miniMapCanvas = document.querySelector('#miniMapCanvas');
miniMapCanvas.width = 300
miniMapCanvas.height = 300;

const carCtx = carCanvas.getContext('2d');


const worldString = localStorage.getItem('world')
var world = worldString ? World.Load(JSON.parse(worldString)) : new World(new Graph())
var carString = localStorage.getItem('car')
var moldCar = carString ? JSON.parse(carString) : null
var viewPort = new ViewPort(carCanvas, world.zoom, world.offset)
var miniMap = null

var cars = []
var bestCar = null
var traffic = []
// var roadBorders = []

restart(world)

function generateCars(N) {
    const starts = world.markings.filter(m => m instanceof Start)
    let start = starts.at(0)// starts[random(0, starts.length - 1, true)]
    let point = start?.center ?? new Point(100, 100)
    let dir = start?.directionVector ?? new Point(0, -1)
    let cars = Array.from({length: Number(N)}, (_, inx) => {
            let car = new Car(point.x, point.y, 30, 50, {
                controlType: 'AI',
                angle: Math.PI / 2 - angle(dir),
                maxSpeed: 4,
                color: "red",
                label: String(inx)
            })
            if (moldCar) car.load(moldCar)
            return car
        }
    )

    return cars

}

function restart(world) {
    cars = generateCars(N)
    bestCar = cars.at(0)
    viewPort = new ViewPort(carCanvas, 1, world.offset)
    miniMap = new MiniMap(miniMapCanvas, world.graph, 300);
}


function discard() {
    localStorage.removeItem('bestBrain')
}

function saveBrain() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

async function LoadCar(event) {
    debugger
    let carJson = await loadJsonFile(event)
    event.target.value = ''
    moldCar = carJson
    localStorage.setItem('car', JSON.stringify(carJson))
    restart(world)
}

async function loadWorld(event) {
    let worldJson = await loadJsonFile(event)
    world = World.Load(worldJson)
    restart(world)
}



var animationFrameId = 0
viewPort.addEventListener('change', () => {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = requestAnimationFrame(animate)
})

update()

function update(time) {
    let somethingUpdate = false
    for (let car of traffic) {
        somethingUpdate = somethingUpdate || car.update(world.roadBorders, [])
    }

    for (let car of cars.filter(car => !car.damage)) {
        somethingUpdate = somethingUpdate || car.update(world.roadBorders, traffic)
    }
    if (somethingUpdate) {
        animate(time)
        requestAnimationFrame(update)
    }
}


function animate(time) {

    viewPort.reset()

    bestCar = cars.reduce((best, current) => {
        return current.fitness > best.fitness ? current : best;
    }, cars[0]);

    if (bestCar && !bestCar.damage) {
        viewPort.offset.x = -bestCar.x
        viewPort.offset.y = -bestCar.y
    }

    viewPort.reset()

    world.cars = cars
    world.bestCar = bestCar

    world.draw(carCtx, viewPort, {showStartMarkings: false})
    miniMap.update(viewPort, cars)
    // carCtx.restore()

}