import Graph from '../js/math/graph.js'
import ViewPort from "../js/viewport.js";
import World from "../js/world.js"
import {getNearestSegment} from "../js/utils/math-utils.js";
import MiniMap from "../js/visualizer/miniMap.js"
import Segment from "../js/primitives/segment.js";
import {fetchLastFile} from "./operationUtil.js";
import {arrayOrderHash} from "../js/utils/codeflow-utils.js";

const rightPanelWidth = 300;

const carCanvas = document.querySelector('#carCanvas');
carCanvas.width = window.innerWidth;
carCanvas.height = window.innerHeight;

const miniMapCanvas = document.querySelector('#miniMapCanvas');
miniMapCanvas.width = rightPanelWidth
miniMapCanvas.height = rightPanelWidth;

statistics.style.width = rightPanelWidth + "px"

const carCtx = carCanvas.getContext('2d');

var worldJson = await fetchLastFile('world', './saved/small_with_target.world')
var world = World.Load(worldJson) ?? new World(new Graph())
var carMold = await fetchLastFile('car', './saved/right_hand_rule.car')
var viewPort = new ViewPort(carCanvas, world.zoom, world.offset)
var miniMap = null

var myCar = null
var frameCount = 0

var hashCarStatsOrder = -1;

reload(world)

function reload(world) {
    world.cars.length = 0
    world.addGenerateCars({type: 'KEYS', carMold, color: 'gray'})
    world.addGenerateCars({N:30, type: 'AI', carMold, mutation:0.1})
    myCar = world.cars.at(0)
    viewPort = new ViewPort(carCanvas, 1, world.offset)
    miniMap = new MiniMap(miniMapCanvas, world.graph, 300);
    updateBoard()

}

function updateBoard() {

    var carEl = []
    for (let car of world.cars) {

        let div = document.getElementById(car.id) || ( _=>{
            let div = document.createElement('div')
            div.id = car.id
            div.style.color = car.color
            div.classList.add('stat')
            return div
        })();
        if(div.progress != car.progress){
            div.progress = car.progress
            div.innerText = car.id + ': ' + (car.progress * 100).toFixed(1) + '%'
        }

        carEl.push(div)

    }
    let newHashOrder = arrayOrderHash(world.cars,'id')
    if(newHashOrder !== hashCarStatsOrder) {
        statistics.replaceChildren(...carEl)
        hashCarStatsOrder = newHashOrder
    }

}

update()

function update(time) {
    let somethingUpdate = false
    let borders = world.corridor.borders || world.roadBorders
    let myCar = world.cars[0]

    for (let car of world.cars.filter(car => !car.damage)) {
        somethingUpdate = car.update(borders, []) || somethingUpdate

    }
    for (let car of world.cars) {
        updateCarProgress(car)
    }
    world.cars.sort((carA, carB) => carB.progress - carA.progress)
    updateBoard()


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
    myCar = world.cars.at(0)

    if (myCar && !myCar.damage) {
        viewPort.offset.x = -myCar.x
        viewPort.offset.y = -myCar.y
    }

    viewPort.reset()


    world.bestCar = myCar

    world.draw(carCtx, viewPort, {showStartMarkings: false, drawSensor: false})
    miniMap.update(viewPort, world.cars)


}

function updateCarProgress(car) {
    if (!car.finishTime) {
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
        if (car.progress > 1) {
            car.progress = 1
            car.finishTime = frameCount
        }
    }
}