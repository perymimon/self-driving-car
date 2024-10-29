import Graph from '../../js/math/graph.js'
import {fetchLastFile, onElementResize} from "../../js/utils/codeflow-utils.js";
import ViewPort from "../../js/viewport.js";
import BrainVisualizer from "../../js/visualizer/brain-visualizer.js";
import MiniMap from "../../js/visualizer/miniMap.js"
import World from "../../js/world.js"


const rightPanelWidth = 300;

onElementResize(carCanvas, function (rect, element) {
    element.width = rect.width;
    element.height = rect.height
})
onElementResize(miniMapCanvas, function (rect, element) {
    element.width = rect.width;
    element.height = rect.height
})
onElementResize(networkCanvas, function (rect, element) {
    element.width = rect.width;
    element.height = rect.height
})

// const carCanvas = document.querySelector('#carCanvas');
// carCanvas.width = window.innerWidth / 2;
// carCanvas.height = window.innerHeight;

// const miniMapCanvas = document.querySelector('#miniMapCanvas');
// miniMapCanvas.width = rightPanelWidth
// miniMapCanvas.height = rightPanelWidth;

// const networkCanvas = document.querySelector('#networkCanvas');
// networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

let worldJson = await fetchLastFile('last-world-saved', '../../saved/small_with_target.world')
var world = World.Load(worldJson) ?? new World(new Graph())
var carMold = await fetchLastFile('car', '../../saved/right_hand_rule.car')
var viewPort = new ViewPort(carCanvas, world.zoom, world.offset)
var miniMap = null
var myCar = null

reload(world)

function reload(world) {
    world.cars.length = 0
    world.addGenerateCars({type: 'KEYS', carMold, color: 'gray', name: 'Me'})
    // world.addGenerateCars({N: 30, type: 'AI', carMold, mutation: 0.2, name: 'AI{i}'})
    for (let car of world.cars) {
        car.noDamage = true
    }

    myCar = world.cars.at(0)
    viewPort = new ViewPort(carCanvas, 1, world.offset)
    miniMap = new MiniMap(miniMapCanvas, world.graph, 200);
    world.bestCar = myCar
}

update()

async function update(time) {
    for (let car of world.cars.filter(car => !car.damage)) {
        car.update(world.roadBorders, [], world?.corridor.skeleton)
    }
    world.cars.sort((carA, carB) => carB.progress - carA.progress)
    animate(time)
    requestAnimationFrame(update)

}

var animationFrameId = 0
viewPort.addEventListener('change', () => {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = requestAnimationFrame(animate)
})


function animate() {
    if (myCar && !myCar.damage) {
        viewPort.offset.x = -myCar.x
        viewPort.offset.y = -myCar.y
    }

    viewPort.reset()
    world.draw(carCtx, viewPort, {showCorridorBorder: false, drawSensor: true})
    miniMap.update(viewPort, world.cars)
    BrainVisualizer.drawNetwork(networkCtx, world.bestCar.controls.brain)
}

