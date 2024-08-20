import MarkingEditor from "../bases/markingEditor.js";
import Light from "../markings/light.js";

export default class LightEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector){
        return new Light(
            center,
            directionVector,
            this.world.roadWidth/2,
            this.world.roadWidth/2
        );
    }

}