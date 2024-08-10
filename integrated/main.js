import Graph from '../world-editor/js/math/graph.js'
import ViewPort from "../world-editor/js/viewport.js";
import World from "../world-editor/js/world.js"
import {angle} from "../world-editor/js/math/utils.js";
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
let world = worldInfo ? World.Load(worldInfo) : new World(new Graph())
var viewPort = new ViewPort(carCanvas, world.zoom, world.offset)

const N = 100
const mutate = 0.3
var cars = []
var bestCar = null
var traffic = []
var roadBorders = []

// restart(world)

function restart(world) {
    cars = generateCars(N)
    bestCar = cars.at(0)
    if (localStorage.getItem('bestBrain')) {
        let bestBrain = JSON.parse(localStorage.getItem('bestBrain'));
        for (let car of cars) {
            let brain = structuredClone(bestBrain)
            car.brain = NeuralNetwork.mutate(brain, mutate);
        }
        cars[0].brain = bestBrain
    }
    roadBorders = world.roadBorders
        // .map(b => b.base.segments)
        // .flat()
        .map(s => [s.p1, s.p2])
    viewPort = new ViewPort(carCanvas, 1, world.offset)
}

animate()

function generateCars(N) {
    const starts = world.markings.filter(m => m instanceof Start)
    let start = starts[random(0,starts.length-1,true)]
    let point = start?.center ?? new Point(100, 100)
    let dir = start?.directionVector ?? new Point(0, -1)
    return Array.from(Array(N), () => new Car(point.x, point.y, 30, 50, "AI", Math.PI / 2 - angle(dir), 4, 'red'))
}

document.getElementById('saveBrain').addEventListener('click', function save() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
})

document.getElementById('discardBrain').addEventListener('click', function discard() {
    localStorage.removeItem('bestBrain')
})

document.getElementById('fileInput').addEventListener('change', function load(event) {
        const file = event.target.files[0]
        if (!file) {
            alert('No File selected')
            return
        }
        let reader = new FileReader()
        reader.onload = (evt) => {
            let fileContent = evt.target.result
            let jsonData = JSON.parse(fileContent)

            world = World.Load(jsonData)
            restart(world)
        }
        reader.readAsText(file)

    }
)



function animate(time) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    viewPort.reset()

    for (let car of traffic) {
        car.update(roadBorders, [])
    }

    for (let car of cars.filter(car => !car.damage)) {
        car.update(roadBorders, traffic)
    }
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

    world.draw(carCtx, viewPort, false)
    carCtx.restore()

    networkCtx.lineDashOffset = -time / 100

    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height)
    if (bestCar) Visualizer.drawNetwork(networkCtx, bestCar.brain)
    requestAnimationFrame(animate)
}