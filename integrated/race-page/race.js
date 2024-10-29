import Graph from '../../js/math/graph.js'
import ViewPort from "../../js/viewport.js";
import World from "../../js/world.js"
import {getNearestSegment} from "../../js/utils/algebra-math-utils.js";
import MiniMap from "../../js/visualizer/miniMap.js"
import Segment from "../../js/primitives/segment.js";
import {arrayOrderHash, fetchLastFile} from "../../js/utils/codeflow-utils.js";
import {Counter} from "../counter.js";
import AudioEngine from "../../js/Audio/engineAudio.js";
const rightPanelWidth = 300;

const carCanvas = document.querySelector('#carCanvas');
carCanvas.width = window.innerWidth / 2;
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

var hashCarStatsOrder = -1;

reload(world)

function reload(world) {
    world.cars.length = 0
    world.addGenerateCars({type: 'KEYS', carMold, color: 'gray', name: 'Me'})
    world.addGenerateCars({N: 30, type: 'AI', carMold, mutation: 0.2, name: 'AI{i}'})
    myCar = world.cars.at(0)
    viewPort = new ViewPort(carCanvas, 1, world.offset)
    miniMap = new MiniMap(miniMapCanvas, world.graph, 300);
    updateScoreBoard()
    world.bestCar = myCar
}

function updateScoreBoard() {
    var carEl = []
    for (let [i, car] of world.cars.entries()) {
        let div = document.getElementById(car.id) || (_ => {
            let div = document.createElement('div')
            div.id = car.id
            div.style.color = car.color
            div.classList.add('stat')
            return div
        })();

        let text = `${i + 1}:${car.damage ? '☠️️' : '🚨'} ${car.name} `
        // (car.progress * 100).toFixed(1) + '% '
        if (car.finishTime) text += `<span style="float:right">${(car.finishTime / 60).toFixed(1)}s</span>`

        if (text != div.innerHTML)
            div.innerHTML = text

        carEl.push(div)

    }

    let newHashOrder = arrayOrderHash(world.cars, 'id')
    if (newHashOrder !== hashCarStatsOrder) {
        statistics.replaceChildren(...carEl)
        hashCarStatsOrder = newHashOrder
    }

}

var started = true
new Counter(1000).go(counter).then(_ => {
    started = true
    myCar.engine = new AudioEngine();
})
var frameCount = 0

update()

async function update(time) {
    let somethingUpdate = !started
    //todo: move it up to global or world
    if (started) {
        let borders = world.corridor.borders || world.roadBorders

        for (let car of world.cars.filter(car => !car.damage)) {
            somethingUpdate = car.update(borders, []) || somethingUpdate
            car.updateProgress(world?.corridor.skeleton)
            if(car.progress >= world.corridor.length){
                car.progress = world.corridor.length
                car.finishTime = frameCount
            }
        }
        world.cars.sort((carA, carB) => carB.progress - carA.progress)
        updateScoreBoard()
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


function animate() {
    ++frameCount

    if (myCar && !myCar.damage) {
        viewPort.offset.x = -myCar.x
        viewPort.offset.y = -myCar.y
    }

    viewPort.reset()
    world.draw(carCtx, viewPort, {showStartMarkings: false, drawSensor: false})
    miniMap.update(viewPort, world.cars)
}

function updateCarRaceProgress(car) {
    if (!car.finishTime) {
        car.progress = 0
        let corridorSkeleton = world.corridor.skeleton
        let carSeg = getNearestSegment(car, corridorSkeleton)
        for (let seg of corridorSkeleton) {

            if (seg == carSeg) {
                let proj = seg.projectPoint(car)
                let partSeg = new Segment(seg.p1, proj.point)
                // partSeg.draw(carCtx, {color: "red", width: 5})
                car.progress += partSeg.length()
                break
            } else {
                car.progress += seg.length()
                // seg.draw(carCtx, {color: "red", width: 5})
            }


        }
        const totalDistance = world.corridor.skeleton.reduce((acc, b) => acc + b.length(), 0)
        car.progress /= totalDistance
        if (car.progress >= 1) {
            car.progress = 1
            car.finishTime = frameCount
        }
    }
}