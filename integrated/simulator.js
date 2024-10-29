import Graph from '../js/math/graph.js'
import ViewPort from "../js/viewport.js";
import World from "../js/world.js"
import MiniMap from "../js/visualizer/miniMap.js"
import {fetchLastFile} from "../js/utils/codeflow-utils.js";

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

var worldJson = await fetchLastFile('world', './saved/small_with_target.world')
var world = World.Load(worldJson) ?? new World(new Graph())
var carMold = await fetchLastFile('car', './saved/right_hand_rule.car')
var viewPort = new ViewPort(carCanvas, world.zoom, world.offset)
var miniMap = null

var bestCar = null
var traffic = []

reload(world)


function reload(world) {
    let N = Number(clonesInput.value)
    let mutation = Number(mutationInput.value)
    world.cars.length = 0
    world.addGenerateCars({N:1, type:'KEYS', carMold:carMold, mutation})
    world.addGenerateCars({N, type:'AI', carMold:carMold, mutation})
    bestCar = world.cars.at(0)
    viewPort = new ViewPort(carCanvas, 1, world.offset)
    miniMap = new MiniMap(miniMapCanvas, world.graph, 300);
}


update()

function update(time) {
    let somethingUpdate = true
    let borders = world.corridor.borders || world.roadBorders
    for (let car of traffic) {
        somethingUpdate = car.update(borders, []) || somethingUpdate
    }

    for (let car of world.cars.filter(car => !car.damage)) {
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

    bestCar = world.cars.reduce((best, current) => {
        return current.fitness > best.fitness ? current : best;
    }, world.cars[0]);

    if (bestCar && !bestCar.damage) {
        viewPort.offset.x = -bestCar.x
        viewPort.offset.y = -bestCar.y
    }

    viewPort.reset()

    world.bestCar = bestCar

    world.draw(carCtx, viewPort, {showStartMarkings: false})
    miniMap.update(viewPort, world.cars)
    // carCtx.restore()

    networkCtx.lineDashOffset = -time / 100

    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height)
    // if (bestCar) BrainVisualizer.drawNetwork(networkCtx, bestCar.brain)
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
    const file = event.target.files[0]
    event.target.value = ''
    let worldJson = await readJsonFile(file, 'worldFile')
    worldJson = World.Load(worldJson)
    reload(worldJson)
}

async function LoadCar(event) {
    const file = event.target.files[0]
    event.target.value = ''
    carMold = await readJsonFile(file, 'carFile')
    // localStorage.setItem('car', JSON.stringify(carJson))
    reload(world)
}