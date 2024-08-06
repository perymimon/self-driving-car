import MarkingEditor from "./markingEditor.js";
import Yield from "../markings/yield.js";
import Parking from "../markings/parking.js";

export default class ParkingEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector){
        return new Parking(
            center,
            directionVector,
            this.world.roadWidth/2,
            this.world.roadWidth/2
        );
    }

}