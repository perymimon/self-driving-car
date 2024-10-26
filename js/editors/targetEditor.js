import _markingEditor from "./_markingEditor.js";
import Target from "./markings/target.js";

export default class TargetEditor extends _markingEditor {
    constructor(viewport, world) {
        super(viewport, world, 'laneGuides');
    }
    createMarking(center, directionVector) {
        var target = new Target(
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        );
        this.world.targetMarker = target
        return target
    }

}