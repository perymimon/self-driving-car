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

mutationInput.value = mutate
clonesInput.value = N

const carCanvas = document.querySelector('#carCanvas');
carCanvas.width = window.innerWidth;
carCanvas.height = window.innerHeight;

const networkCanvas = document.querySelector('#networkCanvas');
networkCanvas.width = 300;
networkCanvas.height = window.innerHeight - 330;

const miniMapCanvas = document.querySelector('#miniMapCanvas');
miniMapCanvas.width = 300
miniMapCanvas.height = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const worldString = localStorage.getItem('world')
var world = worldString ? World.Load(JSON.parse(worldString)) : new World(new Graph())
var carString = localStorage.getItem('car')
var moldCar = carString ? JSON.parse(carString) : null
var viewPort = new ViewPort(carCanvas, world.zoom, world.offset)
var miniMap = null

var cars = []
var bestCar = null
var traffic = []

reload(world)

function generateCars(N = 1, type = 'AI', mutation = 0) {
    const starts = world.markings.filter(m => m instanceof Start)
    let start = starts.at(0)// starts[random(0, starts.length - 1, true)]
    let point = start?.center ?? new Point(100, 100)
    let dir = start?.directionVector ?? new Point(0, -1)
    return Array.from({length: Number(N)}, (_, i) => {

            return Car.load({
                ...moldCar,
                brain: JSON.parse(localStorage.getItem('bestBrain') ) ?? moldCar.brain,
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

function reload(world) {
    let N = Number(clonesInput.value)
    let mutation = Number(mutationInput.value)
    cars = generateCars(1, 'KEYS').concat(generateCars(N, 'AI', mutation))
    bestCar = cars.at(0)
    viewPort = new ViewPort(carCanvas, 1, world.offset)
    miniMap = new MiniMap(miniMapCanvas, world.graph, 300);
}


update()

function update(time) {
    let somethingUpdate = false
    let borders = world.corridor || world.roadBorders
    for (let car of traffic) {
        somethingUpdate = car.update(borders, []) || somethingUpdate
    }

    for (let car of cars.filter(car => !car.damage)) {
        somethingUpdate = car.update(borders, traffic) || somethingUpdate
    }
    if (somethingUpdate) {
        animate(time)
        requestAnimationFrame(update)
    }
}

var animationFrameId = 0
viewPort.addEventListener('change', () => {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = requestAnimationFrame(animate)
})


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

    networkCtx.lineDashOffset = -time / 100

    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height)
    if (bestCar) Visualizer.drawNetwork(networkCtx, bestCar.brain)
}

document.getElementById('saveBrain').addEventListener('click', saveBrain)
document.getElementById('discardBrain').addEventListener('click', discard)
document.getElementById('worldFileInput').addEventListener('change', loadWorld)
document.getElementById('carFileInput').addEventListener('change', LoadCar)
document.getElementById('resetButton').addEventListener('click', _ => reload(world))

function discard() {
    localStorage.removeItem('bestBrain')
}

function saveBrain() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

async function loadWorld(event) {
    let worldJson = await loadJsonFile(event, 'worldFile')
    event.target.value = ''
    world = World.Load(worldJson)
    reload(world)
}

async function LoadCar(event) {
    let carJson = await loadJsonFile(event, 'carFile')
    event.target.value = ''
    moldCar = carJson
    localStorage.setItem('car', JSON.stringify(carJson))
    reload(world)
}