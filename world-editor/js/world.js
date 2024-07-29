import Envelope from "./primitives/envelope.js";
import Polygon from "./primitives/polygon.js";

export default class World {
    constructor(graph, roadWidth = 100, roadRoundness = 10) {
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;

        this.envelopes = []
        this.roadBorders = []
        this.generate()
    }

    hash() {
        return JSON.stringify(this.graph);
    }

    generate() {
        this.envelopes = this.graph.segments.map(
            seg => new Envelope(seg, this.roadWidth, this.roadRoundness)
        )

        this.roadBorders = Polygon.union(this.envelopes.map(env => env.poly));
    }

    draw(ctx) {
        for (let env of this.envelopes) {
            env.draw(ctx, {fill: '#BBB', stroke: '#BBB', lineWidth: 15});
        }
        this.graph.segments.forEach(seg => {
            seg.draw(ctx, {dash: [10, 10], color: 'white', width: 4});
        });

        this.roadBorders.forEach(road => road.draw(ctx, {color: 'white', width: 4}));
    }

}