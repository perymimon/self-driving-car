import Cross from "../markings/cross.js";
import MarkingEditor from "./markingEditor.js";

export default class CrossEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.graph.segments);
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