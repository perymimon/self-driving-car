import Graph from '../../js/math/graph.js'
import ViewPort from "../../js/viewport.js";
import World from "../../js/world.js"
import MiniMap from "../../js/visualizer/miniMap.js"
import {fetchLastFile} from "../operationUtil.js";

const rightPanelWidth = 300;

const carCanvas = document.querySelector('#carCanvas');
carCanvas.width = window.innerWidth / 2;
carCanvas.height = window.innerHeight;

const miniMapCanvas = document.querySelector('#miniMapCanvas');
miniMapCanvas.width = rightPanelWidth
miniMapCanvas.height = rightPanelWidth;

const carCtx = carCanvas.getContext('2d');

var worldJson = await fetchLastFile('world', './saved/small_with_target.world')
var world = World.Load(worldJson) ?? new World(new Graph())
var carMold = await fetchLastFile('car', './saved/right_hand_rule.car')
var viewPort = new ViewPort(carCanvas, world.zoom, world.offset)
var miniMap = null
var myCar = null

reload(world)

function reload(world) {
    world.cars.length = 0
    world.addGenerateCars({type: 'KEYS', carMold, color: 'gray', name: 'Me'})
    world.addGenerateCars({N: 30, type: 'AI', carMold, mutation: 0.2, name: 'AI{i}'})
    myCar = world.cars.at(0)
    viewPort = new ViewPort(carCanvas, 1, world.offset)
    miniMap = new MiniMap(miniMapCanvas, world.graph, 300);
    world.bestCar = myCar
}

update()

async function update(time) {
    for (let car of world.cars.filter(car => !car.damage)) {
        car.update(world.roadBorders,[],world?.corridor.skeleton)
        car.updateProgress(world?.corridor.skeleton ?? [])
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
    world.draw(carCtx, viewPort, {showCorridorBorder: false})
    miniMap.update(viewPort, world.cars)
}

