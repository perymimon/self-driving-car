import Graph from '../world-editor/js/math/graph.js'
import ViewPort from "../world-editor/js/viewport.js";
import World from "../world-editor/js/world.js"
import {angle} from "../world-editor/js/math/utils.js";
import Start from "../world-editor/js/markings/start.js";
import Point from "../world-editor/js/primitives/point.js";
import MiniMap from "../world-editor/js/visualizer/miniMap.js"
import Car from "./car.js"
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
var  carString = localStorage.getItem('car')
var moldCar = carString? JSON.parse(carString) : null
var viewPort = new ViewPort(carCanvas, world.zoom, world.offset)
var miniMap = null

var cars = []
var bestCar = null
var traffic = []
// var roadBorders = []

restart(world)

function generateCars() {
    const starts = world.markings.filter(m => m instanceof Start)
    let start = starts.at(0)// starts[random(0, starts.length - 1, true)]
    let point = start?.center ?? new Point(100, 100)
    let dir = start?.directionVector ?? new Point(0, -1)
    let cars = Array.from({length: Number(clonesInput.value)}, (_, inx) => {
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
    // if (localStorage.getItem('bestBrain')) {
    //     let bestBrain = JSON.parse(localStorage.getItem('bestBrain'));
    //     for (let car of cars) {
    //         let brain = structuredClone(bestBrain)
    //         car.brain = NeuralNetwork.mutate(brain, Number(mutationInput.value));
    //     }
    //     cars[0].brain = bestBrain
    // }

    return cars

}

function restart(world) {
    cars = generateCars(N)
    bestCar = cars.at(0)
    // roadBorders = world.roadBorders
    // .map(b => b.base.segments)
    // .flat()
    // .map(s => [s.p1, s.p2])
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

document.getElementById('saveBrain').addEventListener('click', saveBrain)
document.getElementById('discardBrain').addEventListener('click', discard)
document.getElementById('worldFileInput').addEventListener('change', loadWorld)
document.getElementById('carFileInput').addEventListener('change', LoadCar)
document.getElementById('resetButton').addEventListener('click', _ => restart(world))


var animationFrameId = 0
viewPort.addEventListener('change', ()=>{
    cancelAnimationFrame(animationFrameId)
    animationFrameId = requestAnimationFrame(animate)
})

update()

function update(time){
    let somethingUpdate = false
    for (let car of traffic) {
        somethingUpdate = somethingUpdate || car.update(world.roadBorders, [])
    }

    for (let car of cars.filter(car => !car.damage)) {
        somethingUpdate = somethingUpdate || car.update(world.roadBorders, traffic)
    }
    if(somethingUpdate){
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

    networkCtx.lineDashOffset = -time / 100

    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height)
    if (bestCar) Visualizer.drawNetwork(networkCtx, bestCar.brain)
}