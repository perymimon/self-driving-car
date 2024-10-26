import Cross from "./markings/cross.js";
import _markingEditor from "./_markingEditor.js";

export default class CrossEditor extends _markingEditor {
    constructor(viewport, world) {
        super(viewport, world, 'graph.segments');
    }
    createMarking(center, directionVector){
        return new Cross(
            center,
            directionVector,
            this.world.roadWidth,
            this.world.roadWidth/2
        );
    }

}