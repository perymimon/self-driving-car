import Start from "../js/markings/start.js";
import Point from "../js/primitives/point.js";
import Car from "../js/items/car.js";
import {angle} from "../js/utils/math-utils.js";
import ViewPort from "../js/viewport.js";
import MiniMap from "../js/visualizer/miniMap.js";
import {fetchLastFile, readJsonFile} from "./operationUtil.js";
import World from "../js/world.js";
import Graph from "../js/math/graph.js";

export const UI = {
    saveBrain: document.getElementById('saveBrain'),
    discardBrain: document.getElementById('discardBrain'),
    worldFileInput: document.getElementById('worldFileInput'),
    carFileInput: document.getElementById('carFileInput'),
    restart: document.getElementById('resetButton'),
    clonesInput: document.getElementById('clonesInput'),
    mutationInput: document.getElementById('mutationInput')
}

if (UI.saveBrain)
    UI.saveBrain.addEventListener('click', saveBrain)
if (UI.discardBrain)
    UI.discardBrain.addEventListener('click', discardBrain)
if (UI.worldFileInput)
    UI.worldFileInput.addEventListener('change', loadWorld)
if (UI.carFileInput)
    UI.carFileInput.addEventListener('change', loadCar)
if (UI.restart)
    UI.restart.addEventListener('click', _ => restart())

var worldJson
var world
var moldCar
var viewPort
var miniMap

export async function setWorld(carCanvas, miniMapCanvas) {
    worldJson = await fetchLastFile('world', './saved/small_with_target.world')
    world = World.Load(worldJson) ?? new World(new Graph())
    moldCar = await fetchLastFile('car', './saved/right_hand_rule.car')
    viewPort = new ViewPort(carCanvas, world.zoom, world.offset)
    miniMap = new MiniMap(miniMapCanvas, w.graph, 300);
    return {world,moldCar,viewPort, miniMap}

}




export function generateCars(N = 1, type = 'AI', mutation = 0) {
    const starts = world.markings.filter(m => m instanceof Start)
    let start = starts.at(0)// starts[random(0, starts.length - 1, true)]
    let point = start?.center ?? new Point(100, 100)
    let dir = start?.directionVector ?? new Point(0, -1)
    return Array.from({length: Number(N)}, (_, i) => {
            var car = null;
            var brain = JSON.parse(localStorage.getItem('bestBrain'))

            car = Car.load({
                ...moldCar,
                brain: brain ?? moldCar.brain,
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

            return car
        }
    )
}


var animationFrameId = 0
viewPort.addEventListener('change', () => {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = requestAnimationFrame(animate)
})

function discardBrain() {
    localStorage.removeItem('bestBrain')
}

function saveBrain() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

async function loadWorld(event) {
    const file = event.target.files[0]
    let worldJson = await readJsonFile(file, 'worldFile')
    event.target.value = ''
     = World.Load(worldJson)
    reload(world)
}

async function loadCar(event) {
    const file = event.target.files[0]
    let carJson = await readJsonFile(file, 'carFile')
    event.target.value = ''
    moldCar = carJson
    localStorage.setItem('car', JSON.stringify(carJson))
    reload(world)
}