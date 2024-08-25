import Graph from '../js/math/graph.js'
import ViewPort from "../js/viewport.js";
import World from "../js/world.js"
import {angle, getNearestSegment} from "../js/utils/math-utils.js";
import Start from "../js/markings/start.js";
import Point from "../js/primitives/point.js";
import MiniMap from "../js/visualizer/miniMap.js"
import Car from "../js/items/car.js"
import Segment from "../js/primitives/segment.js";

const N = 100,
    mutation = 0.1

const rightPanelWidth = 300;

const carCanvas = document.querySelector('#carCanvas');
carCanvas.width = window.innerWidth;
carCanvas.height = window.innerHeight;

const miniMapCanvas = document.querySelector('#miniMapCanvas');
miniMapCanvas.width = rightPanelWidth
miniMapCanvas.height = rightPanelWidth;

statistics.style.width = rightPanelWidth + "px"

const carCtx = carCanvas.getContext('2d');

const worldString = localStorage.getItem('world')
var world = worldString ? World.Load(JSON.parse(worldString)) : new World(new Graph())
var carString = localStorage.getItem('car')
var moldCar = carString ? JSON.parse(carString) : null
var viewPort = new ViewPort(carCanvas, world.zoom, world.offset)
var miniMap = null

var cars = []
var myCar = null
var frameCount = 0

reload(world)

function generateCars(N = 1, type = 'AI', mutation = 0) {
    const starts = world.markings.filter(m => m instanceof Start)
    let start = starts.at(0)// starts[random(0, starts.length - 1, true)]
    let point = start?.center ?? new Point(100, 100)
    let dir = start?.directionVector ?? new Point(0, -1)
    return Array.from({length: Number(N)}, (_, i) => {

            return Car.load({
                ...moldCar,
                brain: JSON.parse(localStorage.getItem('bestBrain')) ?? moldCar.brain,
                x: point.x,
                y: point.y,
                width: 30,
                height: 50,
                controlType: type,
                angle: Math.PI / 2 - angle(dir),
                maxSpeed: 4,
                color: type == 'AI' ? "red" : 'blue',
                label: String(i)
            }, i == 0 ? 0 : mutation)

        }
    )
}

function reload(world) {
    cars = generateCars(1, 'KEYS').concat(generateCars(N, 'AI', mutation))
    myCar = cars.at(0)
    viewPort = new ViewPort(carCanvas, 1, world.offset)
    miniMap = new MiniMap(miniMapCanvas, world.graph, 300);
}


update()

for(let car of cars){
    let div = document.createElement('div');
    div.id = car.id
    div.innerText = car.id
    statistics.appendChild(div)
}

function update(time) {
    let somethingUpdate = false
    let borders = world.corridor.borders || world.roadBorders
    let myCar = cars[0]

    for (let car of cars.filter(car => !car.damage)) {
        somethingUpdate = car.update(borders, []) || somethingUpdate

    }
    updateCarProgress(myCar)


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



function animate() {
    ++frameCount
    viewPort.reset()
    myCar = cars.at(0)
    // bestCar = cars.reduce((best, current) => {
    //     return current.fitness > best.fitness ? current : best;
    // }, cars[0]);

    if (myCar && !myCar.damage) {
        viewPort.offset.x = -myCar.x
        viewPort.offset.y = -myCar.y
    }

    viewPort.reset()


    world.cars = cars
    world.bestCar = myCar

    world.draw(carCtx, viewPort, {showStartMarkings: false, drawSensor: false})
    miniMap.update(viewPort, cars)


}

function updateCarProgress(car){
    if(!car.finishTime) {
        car.progress = 0
        let corridorSkeleton = world.corridor.skeleton
        let carSeg = getNearestSegment(car, corridorSkeleton)
        for (let seg of corridorSkeleton) {

            if (seg == carSeg) {
                let proj = seg.projectPoint(car)
                let partSeg = new Segment(seg.p1, proj.point)
                partSeg.draw(carCtx, {color: "red", width: 5})
                car.progress += partSeg.length()
                break
            }
            seg.draw(carCtx, {color: "red", width: 5})
            car.progress += seg.length()

        }
        const totalDistance = world.corridor.skeleton.reduce((acc, b) => acc + b.length(), 0)
        car.progress /= totalDistance
        if (car.progress > 1) car.progress = 1
        car.finishTime = frameCount
        console.log(car.progress)
    }
}