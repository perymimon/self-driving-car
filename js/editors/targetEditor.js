import MarkingEditor from "../bases/markingEditor.js";
import Target from "../markings/target.js";

export default class TargetEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
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