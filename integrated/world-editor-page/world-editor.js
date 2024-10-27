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
import {
    downloadJSON,
    extractFormData,
    fetchLastFile,
    onElementResize,
    readJsonFile
} from "../../js/utils/codeflow-utils.js";

const ctx = editorCanvas.getContext('2d')

// var rect = editorCanvas.parentNode.getBoundingClientRect();
// editorCanvas.width = rect.width;
// editorCanvas.height = rect.height - editorCanvas.previousElementSibling.offsetHeight;
onElementResize(editorCanvas, function (rect, element) {
    element.width = rect.width;
    element.height = rect.height
})


let worldInfo = await fetchLastFile('last-world-saved', '../../saved/small_with_target.world')
    .catch(e => null)
// const worldString = localStorage.getItem('world')
// const worldInfo = worldString ? JSON.parse(worldString) : null
var world = worldInfo ? World.Load(worldInfo) : new World(new Graph())
var viewPort = new ViewPort(editorCanvas, worldInfo.zoom, worldInfo.offset)
var tools = {
    graph: {editor: new GraphEditor(viewPort, world)},
    stop: {editor: new StopEditor(viewPort, world)},
    cross: {editor: new CrossEditor(viewPort, world)},
    start: {editor: new StartEditor(viewPort, world)},
    yield: {editor: new YieldEditor(viewPort, world)},
    parking: {editor: new ParkingEditor(viewPort, world)},
    target: {editor: new TargetEditor(viewPort, world)},
    light: {editor: new LightEditor(viewPort, world)},
}

restart('graph')

function restart(mode = 'graph') {
    // viewPort = new ViewPort(editorCanvas, w.zoom, w.offset)
    if (world.zoom) viewPort.zoom = world.zoom
    if (world.offset) viewPort.offset = world.offset

    for (let mode in tools) {
        tools[mode].editor.onchange = event => {
            let formdata = extractFormData(construction)
            formdata.roads = true
            world.generate(formdata)
        }
        tools[mode].editor.setWorld(world)
    }
    setEditModeType(mode)
    presetConstructionForm()

}

function presetConstructionForm() {
    construction.elements.roadBorders.checked = Boolean(world.roadBorders?.length)
    construction.elements.buildings.checked = Boolean(world.buildings?.length)
    construction.elements.trees.checked = Boolean(world.trees?.length)
    construction.elements.laneGuides.checked = Boolean(world.laneGuides?.length)
    construction.elements.corridor.checked = Boolean(world.corridor?.length)
}

/*global*/
window.generate2 = function (event) {
    var input = event.target
    var {checked, name} = input
    if (checked) {
        world.generate({[name]: true})
    } else {
        world.dispose({[name]: true})
    }
    presetConstructionForm()


}
window.generate = (options) => {

    world.generate(options)
}
window.dispose = () => world.dispose()
window.save = saveWorld

function saveWorld() {
    world.offset = viewPort.offset
    world.zoom = viewPort.zoom

    downloadJSON(world, 'default.world','world')
    localStorage.setItem('world', JSON.stringify(world))
}

window.load = async function load(event) {
    const file = event.target.files[0]
    if (!file) {
        alert('No File selected')
        return
    }
    let worldInfo = await readJsonFile(file, 'last-world-loaded')
    world = World.Load(worldInfo)
    restart()
}

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

// document.getElementById('graphTools').onsubmit = (evt) => evt.preventDefault()
document.getElementById('graphTools').onchange = function (e) {
    e.preventDefault()
    let formData = new FormData(this);
    let mode = formData.get('graph')
    setEditModeType(mode)
}


function setEditModeType(mode) {
    disableEditors()
    tools[mode]?.editor.enable()
    document.querySelector(`input[value="${mode}"]`).checked = true
}

function disableEditors() {
    for (let mode in tools) {
        tools[mode].editor.disable()
    }
}

animate()

function animate() {
    viewPort.reset()

    world.draw(ctx, viewPort, {showLane: true})
    // viewPort.drawRenderBox(ctx)
    ctx.globalAlpha = 0.3
    for (let mode in tools) {
        tools[mode].editor.display()
    }
    ctx.globalAlpha = 1
    requestAnimationFrame(animate)
}
