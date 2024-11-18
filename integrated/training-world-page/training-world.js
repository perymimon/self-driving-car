import {CANCEL, PolygonSelector, SELECTED} from "../../js/editors/polygonSelector.js";
import Graph from '../../js/math/graph.js'
import {fetchJSONFile, fetchLastFile, onElementResize} from "../../js/utils/codeflow-utils.js";
import ViewPort from "../../js/viewport.js";
import BrainVisualizer from "../../js/visualizer/brain-visualizer.js";
import MiniMap from "../../js/visualizer/miniMap.js"
import World from "../../js/world.js"
import "../../webCompoents/statusbar-2/status-bar.js"

onElementResize(carCanvas, function (rect, element) {
    element.width = Math.floor(rect.width)
    element.height = Math.floor(rect.height)
    console.log(rect)
})
onElementResize(miniMapCanvas, function (rect, element) {
    element.width = Math.floor(rect.width)
    element.height = Math.floor(rect.height)
})
onElementResize(networkCanvas, function (rect, element) {
    element.width = Math.floor(rect.width)
    element.height = Math.floor(rect.height)
})


const worldFilename = localStorage.getItem('worldFilename') ?? '../../saved/small_with_target.world'
let worldJson = await fetchJSONFile(worldFilename);
worldFileNameView.textContent = worldFilename

var world = World.Load(worldJson) ?? new World(new Graph())

const carFilename = localStorage.getItem('carFilename') ?? '../../saved/right_hand_rule.car'
let carMold = await fetchJSONFile(carFilename)
var viewPort = new ViewPort(carCanvas, 1, world.offset)
carFileNameView.textContent = carFilename

/* car selector */
var carSelector = new PolygonSelector(viewPort,[])
function selectCar(event){
    let polygon = event.detail
    let car = world.cars.find(c=> c.polygons == polygon)
    debugger
    carStatusbar.data = car
}
carSelector.addEventListener(SELECTED, selectCar)
// carSelector.addEventListener(CANCEL, (event)=>{
//     debugger
//     carStatusbar.data = null
// })

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');
var miniMap = null
var myCar = null
var selectedCar = null
reload(world)
function reload(world) {
    world.cars.length = 0
    world.addGenerateCars({N:1, type: 'KEYS', carMold, color: 'gray', name: 'Me'})
    // world.addGenerateCars({N: 30, type: 'AI', carMold, mutation: 0.2, name: 'AI{i}'})

    carSelector.setPolygons(world.cars.map(c=>c.polygons))

    // for (let car of world.cars) {
    //     car.noDamageMode = true
    // }

    myCar = world.cars.at(0)
    // viewPort = new ViewPort(carCanvas, 1, world.offset)
    miniMap = new MiniMap(miniMapCanvas, world.graph, 200);
    world.bestCar = myCar
    selectedCar = myCar
    carStatusbar.data = world.bestCar
}


animate()
function animate() {
    for (let car of world.cars.filter(car => !car.damage)) {
        car.update(world.roadBorders, [], world?.corridor.skeleton)
    }
    world.cars.sort((carA, carB) => carB.progress - carA.progress)

    if (myCar && !myCar.damage) {
        viewPort.offset.x = -myCar.x
        viewPort.offset.y = -myCar.y
    }

    viewPort.reset()
    world.draw(carCtx, viewPort, {showCorridorBorder: false, drawSensor: true})

    carSelector.intent?.draw(carCtx,{color:'orange'})

    world.bestCar.draw(carCtx,{color:'orange'})
    miniMap.update(viewPort, world.cars)
    BrainVisualizer.drawNetwork(networkCtx, selectedCar.controls.brain)

    requestAnimationFrame(animate)
}

