import Graph from '../../js/math/graph.js'
import GraphEditor from "../../js/editors/graphEditor.js";
import StopEditor from "../../js/editors/stopEditor.js";
import CrossEditor from "../../js/editors/crossEditor.js";
import ViewPort from "../../js/viewport.js";
import World from "../../js/world.js"
import StartEditor from "../../js/editors/startEditor.js";
import YieldEditor from "../../js/editors/yieldEditor.js";
import ParkingEditor from "../../js/editors/parkingEditor.js";
import TargetEditor from "../../js/editors/targetEditor.js";
import LightEditor from "../../js/editors/lightEditor.js";
import {parseRoads} from "../../js/math/osm.js";

const ctx = editorCanvas.getContext('2d')

var rect = editorCanvas.parentNode.getBoundingClientRect();
editorCanvas.width = rect.width;
editorCanvas.height = rect.height - editorCanvas.previousElementSibling.offsetHeight;

const worldString = localStorage.getItem('world')
const worldInfo = worldString ? JSON.parse(worldString) : null

var world = worldInfo ? World.Load(worldInfo) : new World(new Graph())
var viewPort = null
var tools = {}

restart()
setMode('graph')

function restart(w = world) {
    viewPort = new ViewPort(editorCanvas, w.zoom, w.offset)
    disableEditors()
    tools = {
        graph: {editor: new GraphEditor(viewPort, w)},
        stop: {editor: new StopEditor(viewPort, w)},
        cross: {editor: new CrossEditor(viewPort, w)},
        start: {editor: new StartEditor(viewPort, w)},
        yield: {editor: new YieldEditor(viewPort, w)},
        parking: {editor: new ParkingEditor(viewPort, w)},
        target: {editor: new TargetEditor(viewPort, w)},
        light: {editor: new LightEditor(viewPort, w)},
    }
}

function generate(options) {
    world.generate(options)
    restart(world)
}

/*toolbar*/
document.getElementById('generateButton').onclick = () => generate()
document.getElementById('generateRoads').onclick = () => generate({all: false, roads: true})
document.getElementById('generateBuilding').onclick = () => generate({all: false, buildings: true})
document.getElementById('generateTrees').onclick = () => generate({all: false, trees: true})
document.getElementById('generateLanes').onclick = () => generate({all: false, lanes: true})
document.getElementById('generateCorridor').onclick = () => generate({all: false, corridor: true})
document.getElementById('disposeButton').onclick = function dispose() {
    world.dispose()
}
document.getElementById('saveButton').onclick = function save() {
    world.offset = viewPort.offset
    world.zoom = viewPort.zoom

    let a = document.createElement('a')
    a.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(world))}`)
    a.setAttribute('download', 'name.world')
    a.click()

    localStorage.setItem('world', JSON.stringify(world))
}
document.getElementById('fileInput').addEventListener('change', function load(event) {
        const file = event.target.files[0]
        if (!file) {
            alert('No File selected')
            return
        }
        let reader = new FileReader()
        reader.readAsText(file)
        reader.onload = (evt) => {
            let fileContent = evt.target.result
            let jsonData = JSON.parse(fileContent)

            world = World.Load(jsonData)
            restart(world)
            // localStorage.setItem('world', JSON.stringify(world))
        }
    }
)
const modal = document.getElementById('myModal')

document.getElementById('myModal').addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.close();
    }
})

// Get the button that opens the modal
document.getElementById('openOSMModal').addEventListener('click', () => {
    modal.showModal();
})

// Get the button that closes the modal
document.getElementById('closeModalBtn').addEventListener('click', () => {
    modal.close();
})
document.getElementById('processModalBtn').onclick = function parseOsmData() {
    if (osmInput.value == "") return

    let {points, segments} = parseRoads(JSON.parse(osmInput.value))
    world.graph.points = points
    world.graph.segments = segments
    world.generate({buildings: false, trees: false})
    console.log(world.laneGuides)
    modal.close()
}

document.getElementById('graphTools').onsubmit = (evt) => evt.preventDefault()
document.getElementById('graphTools').onchange = function (e) {
    e.preventDefault()
    let formData = new FormData(this);
    let mode = formData.get('graph')
    setMode(mode)
}

animate()

function animate() {
    viewPort.reset()

    world.draw(ctx, viewPort, {showLane: false, showItems: 200})
    // viewPort.drawRenderBox(ctx)
    ctx.globalAlpha = 0.3
    for (let mode in tools) {
        tools[mode].editor.display()
    }
    ctx.globalAlpha = 1
    requestAnimationFrame(animate)
}

function setMode(mode) {
    disableEditors()
    tools[mode]?.editor.enable()
    document.querySelector(`input[value="${mode}"]`).checked = true
}

function disableEditors() {
    for (let mode in tools) {
        tools[mode].editor.disable()
    }
}