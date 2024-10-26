import _markingEditor from "./_markingEditor.js";
import Parking from "./markings/parking.js";

export default class ParkingEditor extends _markingEditor {
    constructor(viewport, world) {
        super(viewport, world, 'laneGuides');
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