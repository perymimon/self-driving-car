import Car from "../js/items/car.js";
import Graph from "../js/math/graph.js";
import {fetchJSONFile} from "../js/utils/codeflow-utils.js";
import World from "../js/world.js";

export function saveBrain(car){

}

export async function loadBrain(serial){
    var info = JSON.stringify(serial)
}

export async function loadCar(mutation = 0){
    const filename = localStorage.getItem('carFilename') ?? '../../saved/right_hand_rule.car'
    var carJSON = await fetchJSONFile(filename)
    // if(carJSON.brain){
    //     // we are is radu style
    //     let brain = carJSON.brain
    //     delete carJSON.brain
    //     carJSON.controls.brain = brain
    //
    // }
    return {carJSON,filename}

}

export function saveWorld(world){

}

export async function loadWorld(){
    const filename = localStorage.getItem('worldFilename') ?? '../../saved/small_with_target.world'
    var worldJSON = await fetchJSONFile(filename);
    var world = World.Load(worldJSON) ?? new World(new Graph())
    return {world, filename}
}

