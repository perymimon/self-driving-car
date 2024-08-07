import Envelope from "./primitives/envelope.js";
import Polygon from "./primitives/polygon.js";
import {add, distance, eps, lerp, scale} from "./math/utils.js";
import Segment from "./primitives/segment.js";
import Point from "./primitives/point.js";
import Tree from "./items/tree.js";
import Building from "./items/building.js";
export default class World {
    roadWidth = 100
    roadRoundness = 10
    buildingWidth = 150
    buildingMinLength = 150
    spacing = 50
    treeSize = 160

    constructor(graph) {
        this.graph = graph;

        this.envelopes = []
        this.roadBorders = []
        this.buildings = []
        this.trees = []
        this.laneGuides = []

        this.markings = []

        this.generate()
    }

    hash() {
        return JSON.stringify(this.graph);
    }

    generate() {
        let {graph, roadRoundness, roadWidth} = this
        this.envelopes = graph.segments.map(
            seg => new Envelope(seg, roadWidth, roadRoundness)
        )

        this.roadBorders = Polygon.union(this.envelopes.map(env => env.poly));

        this.buildings = this.#generateBuildings()
        this.trees = this.#generatedTrees(30)
        this.laneGuides = this.#generateLaneGuides()
    }

    #generateLaneGuides(){
        const tmpEvnelope = []
        for (let seg of this.graph.segments) {
            tmpEvnelope.push(
                new Envelope(
                    seg,
                    this.roadWidth / 2,
                    this.roadRoundness
                ),
            )
        }
        return Polygon.union(tmpEvnelope.map(seg => seg.poly))
    }

    #generateBuildings() {
        const tmpEvnelope = []
        for (let seg of this.graph.segments) {
            tmpEvnelope.push(
                new Envelope(seg, this.roadWidth + this.buildingWidth + this.spacing * 2, this.roadRoundness),
            )
        }
        let guidesSegments = Polygon.union(tmpEvnelope.map(env => env.poly))
        guidesSegments = guidesSegments.filter(seg => seg.length() >= this.buildingMinLength)

        let supports = []
        for (let seg of guidesSegments) {
            const len = seg.length() + this.spacing
            let count = Math.floor((len) / (this.buildingMinLength + this.spacing))
            let supportLength = (len / count) - this.spacing

            let dir = seg.directionVector()

            let q1 = seg.p1
            let q2 = add(q1, scale(dir, supportLength))
            supports.push(new Segment(q1, q2))

            for (let i = 1; i < count; i++) {
                q1 = add(q2, scale(dir, this.spacing))
                q2 = add(q1, scale(dir, supportLength))
                supports.push(new Segment(q1, q2))
            }
        }
        let bases = supports.map(seg => new Envelope(seg, this.buildingWidth).poly)

        let removed = new Set();
        for (let [i, base1] of bases.entries()) {
            if (removed.has(base1)) continue
            for (let base2 of bases.slice(i + 1)) {
                if (removed.has(base2)) continue
                let removing = false
                removing = removing || base1.intersectCircumCircles(base2, this.spacing) && base1.intersectPoly(base2)
                removing = removing || base1.distanceToPoly(base2) < this.spacing - eps
                if (removing) removed.add(base2)
            }
        }
        bases = Array.from(new Set(bases).difference(removed))
        return bases.map(b=> new Building(b,200))
    }

    #generatedTrees(count = 10, tryCount = 30) {
        let points = [
            ...this.roadBorders.map(s => [s.p1, s.p2]).flat(),
            ...this.buildings.map(p => p.base.points).flat()
        ]
        let left = Math.min(...points.map(p => p.x))
        let right = Math.max(...points.map(p => p.x))
        let top = Math.min(...points.map(p => p.y))
        let bottom = Math.max(...points.map(p => p.y))

        const illegalPoly = [
            ...this.buildings.map(b=> b.base),
            ...this.envelopes.map(e => e.poly)
        ]

        const trees = []
        let trying = tryCount
        while (trying--) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(top, bottom, Math.random())
            )
            let keep = !illegalPoly.some(poly => poly.containsPoint(p))
            keep = keep && !illegalPoly.some(poly => poly.distanceToPoint(p) < this.treeSize / 2)
            keep = keep && !trees.some(tree => distance(tree.center, p) < this.treeSize)
            let closeToSomething = illegalPoly.some(poly => poly.distanceToPoint(p) <= this.treeSize * 2)
            keep = keep && closeToSomething
            if (keep) {
                trees.push( new Tree(p, this.treeSize))
                if (trees.length >= count) return trees
                trying = tryCount
            }

        }
        return trees
    }

    draw(ctx, viewPoint) {
        for (let env of this.envelopes) {
            env.draw(ctx, {fill: '#BBB', stroke: '#BBB', lineWidth: 15});
        }

        for(let marking of this.markings){
            marking.draw(ctx);
        }

        this.graph.segments.forEach(seg => {
            seg.draw(ctx, {dash: [10, 10], color: 'white', width: 4});
        });

        this.roadBorders.forEach(road => road.draw(ctx, {color: 'white', width: 4}));

        let items = [...this.buildings, ...this.trees]
            .sort((a, b) =>
                b.base.distanceToPoint(viewPoint) -
                a.base.distanceToPoint(viewPoint)
            )
        items.forEach(item => {
            item.draw(ctx, viewPoint,{drawId: true})
        });

        // for( const seg of this.laneGuides){
        //     seg.draw(ctx, {color:'red'})
        // }

    }

}