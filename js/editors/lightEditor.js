import _markingEditor from "./_markingEditor.js";
import Light from "./markings/light.js";

export default class LightEditor extends _markingEditor {
    constructor(viewport, world) {
        super(viewport, world, 'laneGuides');
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