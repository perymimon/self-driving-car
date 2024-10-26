import _markingEditor from "./_markingEditor.js";
import Yield from "./markings/yield.js";

export default class YieldEditor extends _markingEditor {
    constructor(viewport, world) {
        super(viewport, world, 'laneGuides');
    }
    createMarking(center, directionVector){
        return new Yield(
            center,
            directionVector,
            this.world.roadWidth/2,
            this.world.roadWidth/2
        );
    }

}