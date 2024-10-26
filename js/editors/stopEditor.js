import Stop from "./markings/stop.js";
import _markingEditor from "./_markingEditor.js";

export default class StopEditor extends _markingEditor {
    constructor(viewport, world) {
        super(viewport, world, 'laneGuides');
    }
    createMarking(center, directionVector){
        return new Stop(
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        );
    }

}