import {PolygonSelector} from "../../js/editors/polygonSelector.js";
import {onElementResize} from "../../js/utils/codeflow-utils.js";
import ViewPort from "../../js/viewport.js";
import BrainVisualizer from "../../js/visualizer/brain-visualizer.js";
import MiniMap from "../../js/visualizer/miniMap.js"
import "../../webCompoents/statusbar-2/status-bar.js"
import {loadCar, loadWorld} from "../common.js";

onElementResize(carCanvas, function (rect, element) {
    element.width = Math.floor(rect.width)
    element.height = Math.floor(rect.height)
})

onElementResize(miniMapCanvas, function (rect, element) {
    element.width = Math.floor(rect.width)
    element.height = Math.floor(rect.height)
})
onElementResize(networkCanvas, function (rect, element) {
    element.width = Math.floor(rect.width)
    element.height = Math.floor(rect.height)
})

var {world,filename:woldFile} = await loadWorld()
worldFileNameView.textContent = woldFile
var {carJSON,filename:carFile} = await loadCar()
carFileNameView.textContent = carFile


var viewPort = new ViewPort(carCanvas, 1, world.offset)
const ctx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');
var miniMap = new MiniMap(miniMapCanvas, world.graph, 200);
var myCar = null
var selectedCar = null

/* car selector */
var carSelector = new PolygonSelector(viewPort,[], function selectCar(event){
        let polygon = event.detail
        let car = world.cars.find(c=> c.polygons == polygon)
        carStatusbar.data = car
    }
)

reload(world)
function reload(world) {
    miniMap.graph = world.graph
    world.cars.length = 0
    world.addGenerateCars(1, carJSON, 0, {type: 'KEYS', color: 'gray', name: 'Me'})
    // world.addGenerateCars(1, carJSON, 0.2, {type: 'AI', name: 'AI{i}'})

    carSelector.setPolygons(world.cars.map(c=>c.polygons))
    // for (let car of world.cars)
    //     car.noDamageMode = true

    myCar = world.cars.at(0)
    selectedCar = myCar

    carStatusbar.data = selectedCar
}


animate()

function animate() {
    requestAnimationFrame(animate)
    if(globalThis.pause == true) return

    for (let car of world.cars.filter(car => !car.damage)) {
        car.update(world.roadBorders, [], world?.corridor.skeleton)
    }
    world.cars.sort((carA, carB) => carB.fitness - carA.fitness)
    var bestCar = world.cars.at(0)

    if (myCar && !myCar.damage) {
        viewPort.offset.x = -myCar.x
        viewPort.offset.y = -myCar.y
    }

    viewPort.reset()
    // world.draw(ctx, viewPort, {showCorridorBorder: false, drawSensor: true})

    myCar?.draw(ctx, {drawSensor:true, color:'blue'})
    let intentCar = world.cars.find(c=> c.polygons == carSelector.intent)
    intentCar?.draw(ctx,{color:'orange'})



    miniMap.update(viewPort, world.cars)
    BrainVisualizer.drawNetwork(networkCtx, selectedCar.controls.brain)



}

