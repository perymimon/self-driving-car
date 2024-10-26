import _markingEditor from "./_markingEditor.js";
import Start from "./markings/start.js";

export default class StartEditor extends _markingEditor {
    constructor(viewport, world) {
        super(viewport, world, 'laneGuides');

    }
    createMarking(center, directionVector) {
        let start = new Start(
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        )
        this.world.startMarker = start
        return start;
    }

}