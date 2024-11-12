import CrossEditor from "../../js/editors/crossEditor.js";
import GraphEditor from "../../js/editors/graphEditor.js";
import LightEditor from "../../js/editors/lightEditor.js";
import ParkingEditor from "../../js/editors/parkingEditor.js";
import StartEditor from "../../js/editors/startEditor.js";
import StopEditor from "../../js/editors/stopEditor.js";
import TargetEditor from "../../js/editors/targetEditor.js";
import YieldEditor from "../../js/editors/yieldEditor.js";
import Graph from '../../js/math/graph.js'
import {parseRoads} from "../../js/math/osm.js";
import {
    copyToClipboard,
    downloadJSON,
    extractFormData,
    fetchLastFile,
    onElementResize,
    readJsonFile
} from "../../js/utils/codeflow-utils.js";
import ViewPort from "../../js/viewport.js";
import MiniMap from "../../js/visualizer/miniMap.js";
import World from "../../js/world.js"


window.generate = (options) => world.generate(options)
window.generate2 = generate2
window.dispose = () => world.dispose()
window.save = saveWorld
window.load = load
window.parseOsmData = parseOsmData;
window.copyQL = copyQLOpenStreetMap
const ctx = editorCanvas.getContext('2d')


// var rect = editorCanvas.parentNode.getBoundingClientRect();
// editorCanvas.width = rect.width;
// editorCanvas.height = rect.height - editorCanvas.previousElementSibling.offsetHeight;
onElementResize(editorCanvas, function (rect, element) {
    element.width = rect.width;
    element.height = rect.height
})
onElementResize(miniMapCanvas, function (rect, element) {
    element.width = rect.width;
    element.height = rect.height
})


let worldJson = await fetchLastFile('worldFilename', '../../saved/small_with_target.world')
// const worldString = localStorage.getItem('world')
// const worldInfo = worldString ? JSON.parse(worldString) : null
var world = worldJson ? World.Load(worldJson) : new World(new Graph())
var viewPort = new ViewPort(editorCanvas, worldJson.zoom, worldJson.offset)
var miniMap = new MiniMap(miniMapCanvas, world.graph, 300);

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
    if (world.zoom) viewPort.zoom = world.zoom
    if (world.offset) viewPort.offset = world.offset

    miniMap.graph = world.graph
    // init toolbar
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
function generate2(event) {
    var input = event.target
    var {checked, name} = input
    if (checked) {
        world.generate({[name]: true})
    } else {
        world.dispose({[name]: true})
    }
    presetConstructionForm()


}

function saveWorld() {
    world.offset = viewPort.offset
    world.zoom = viewPort.zoom

    downloadJSON(world, 'default.world', 'world')
    localStorage.setItem('world', JSON.stringify(world))
}


async function load(event) {
    const file = event.target.files[0]
    if (!file) {
        alert('No File selected')
        return
    }
    let worldInfo = await readJsonFile(file, 'worldFilename')
    world = World.Load(worldInfo)
    restart()
}

function parseOsmData() {
    if (osmInput.value == "") return

    let {points, segments} = parseRoads(JSON.parse(osmInput.value))
    world.graph.points = points
    world.graph.segments = segments
    var options = extractFormData(construction2)
    world.generate(options)
    osmmodal.close()
}

document.getElementById('graphTools').onchange =
    function graphTools(e) {
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


async function copyQLOpenStreetMap() {
    var text = await fetch('./osm.ql').then(res => res.text())
    await copyToClipboard(text);
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
    miniMap.update(viewPort, [])
}

