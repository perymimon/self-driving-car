import Envelope from "./primitives/envelope.js";
import Polygon from "./primitives/polygon.js";
import {add, angle, distance, eps, lerp, scale} from "./utils/algebra-math-utils.js";
import Segment from "./primitives/segment.js";
import Tree from "./items/tree.js";
import Building from "./items/building.js";
import Graph from "./math/graph.js";
import Cross from "./markings/cross.js";
import Light from "./markings/light.js";
import Parking from "./markings/parking.js";
import Start from "./markings/start.js";
import Stop from "./markings/stop.js";
import Target from "./markings/target.js";
import Yield from "./markings/yield.js";
import Point from "./primitives/point.js";
import Car from "./items/car.js";

const Markings = {
    'cross': Cross,
    'light': Light,
    'parking': Parking,
    'start': Start,
    'stop': Stop,
    'target': Target,
    'yield': Yield,
    Cross, Light, Parking, Start, Stop, Target, Yield,
}

export default class World {
    roadWidth = 100
    roadRoundness = 6
    buildingWidth = 150
    buildingMinLength = 150
    spacing = 50
    treeSize = 160
    #lastViewPoint = new Point(0, 0)

    constructor(graph) {
        this.graph = graph || new Graph();

        this.envelopes = []
        this.roadBorders = []
        this.buildings = []
        this.trees = []
        this.laneGuides = []

        this.cars = []
        this.bestCar = null

        this.markings = []

        if (graph)
            this.generate()
    }

    dispose() {
        this.graph.dispose()
        this.envelopes = []
        this.roadBorders = []
        this.buildings = []
        this.trees = []
        this.laneGuides = []
        this.markings = []
    }

    static Load(info) {
        let world = new World();
        world.graph = Graph.Load(info.graph)
        world.roadWidth = info.roadWidth
        world.roadRoundness = info.roadRoundness
        world.buildingWidth = info.buildingWidth
        world.buildingMinLength = info.buildingMinLength
        world.spacing = info.spacing
        world.treeSize = info.treeSize
        world.envelopes = info.envelopes.map((env) => Envelope.load(env))
        world.roadBorders = info.roadBorders.map(seg => Segment.load(seg))
        world.buildings = info.buildings.map((env) => Building.load(env))
        world.trees = info.trees.map((t) => new Tree(t.center, info.treeSize))
        world.laneGuides = info.laneGuides.map((seg) => Segment.load(seg))
        world.markings = info.markings.map((mark) => {
            return new Markings[mark.type](
                Point.load(mark.center),
                Point.load(mark.directionVector),
                mark.width,
                mark.height
            )
        })
        world.zoom = info.zoom
        world.offset = info.offset
        // if (info.corridor) world.corridor = {
        //     borders: info.corridor.borders.map(seg => Segment.load(seg)),
        //     skeleton: info.corridor.skeleton.map(seg => Segment.load(seg))
        // }
        if (info.corridor)
            world.generate({all: false, corridor: true})

        return world
    }

    hash() {
        return JSON.stringify(this.graph);
    }

    generate({all = true, corridor = false, buildings = false, trees = false, roads = false, lanes = false} = {}) {
        let {graph, roadRoundness, roadWidth} = this
        if (all || roads) {
            this.envelopes = graph.segments.map(seg =>
                new Envelope(seg, roadWidth, roadRoundness)
            )
            this.roadBorders = Polygon.multiUnion(this.envelopes.map(env => env.poly));
            this.buildings = []
            this.trees = []
            this.laneGuides = []
        }
        if (all || buildings) {
            this.buildings = this.#generateBuildings()
            this.trees = []
        }

        if (all || trees) {
            let treeCount = Math.min(10, this.buildings.length / 10)
            this.trees = trees ? this.#generatedTrees(treeCount) : []
        }
        if (all || lanes)
            this.laneGuides = this.#generateLaneGuides()

        if (all || corridor) {
            let startMarker = this.markings.find(m => m instanceof Start)
            let targetMarker = this.markings.find(m => m instanceof Target)
            if (startMarker && targetMarker) {
                let startPoint = startMarker.center
                let targetPoint = targetMarker.center
                this.generateCorridor(startPoint, targetPoint)
            }
        }

    }

    addGenerateCars({N = 1, type = 'AI', mutation = 0, carMold = null, color = 'red'} = {}) {
        const starts = this.markings.filter(m => m instanceof Start)
        let start = starts.at(0)// starts[random(0, starts.length - 1, true)]
        let point = start?.center ?? new Point(100, 100)
        let dir = start?.directionVector ?? new Point(0, -1)
        let cars = []
        var brain = JSON.parse(localStorage.getItem('bestBrain'))
        for (let i of Array(N).keys()) {
            cars.push(Car.load({
                ...carMold,
                brain: brain ?? carMold?.brain,
                x: point.x,
                y: point.y,
                width: 30,
                height: 50,
                controlType: type,
                angle: Math.PI / 2 - angle(dir),
                maxSpeed: 4,
                color,
                label: String(i)
            }, i == 0 ? 0 : mutation))
            this.cars.push(...cars)
        }
    }

    generateCorridor(start, end) {
        var path = this.graph.getShortestPath(start, end)

        let segs = []
        path.reduce((seg0, seg1) => {
            segs.push(new Segment(seg0, seg1))
            return seg1
        })
        let tmpEnvelope = segs.map(s => new Envelope(s, this.roadWidth, this.roadRoundness))
        let segments = Polygon.multiUnion(tmpEnvelope.map(env => env.poly))
        this.corridor = {
            borders: segments,
            skeleton: segs
        }
    }

    #generateLaneGuides() {
        const tmpEnvelope = []
        for (let seg of this.graph.segments) {
            tmpEnvelope.push(
                new Envelope(
                    seg,
                    this.roadWidth / 2,
                    this.roadRoundness
                ),
            )
        }
        return Polygon.multiUnion(tmpEnvelope.map(seg => seg.poly))
    }

    #generateBuildings() {
        const tmpEvnelope = []
        let segments = this.graph.segments

        for (let seg of segments) {
            tmpEvnelope.push(
                new Envelope(seg, this.roadWidth + this.buildingWidth + this.spacing * 2, this.roadRoundness),
            )
        }

        let guidesSegments = Polygon.multiUnion(tmpEvnelope.map(env => env.poly))
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

                removing = removing
                    || base1.intersectPoly(base2, this.spacing)
                    || base1.distanceToPoly(base2) < this.spacing - eps

                if (removing) removed.add(base2)
            }
        }
        bases = Array.from(new Set(bases).difference(removed))
        return bases.map(b => new Building(b, 200))
    }

    #generatedTrees(count = 10, tryCount = 40) {
        let points = [
            ...this.roadBorders.map(s => [s.p1, s.p2]).flat(),
            ...this.buildings.map(p => p.base.points).flat()
        ]
        let left = Math.min(...points.map(p => p.x))
        let right = Math.max(...points.map(p => p.x))
        let top = Math.min(...points.map(p => p.y))
        let bottom = Math.max(...points.map(p => p.y))

        const illegalPoly = [
            ...this.buildings.map(b => b.base),
            ...this.envelopes.map(e => e.poly)
        ]

        const trees = []
        let trying = tryCount
        while (trying--) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(top, bottom, Math.random())
            )
            let keep = !illegalPoly.some(poly => poly.containsPoint(p, this.treeSize / 2))
                && !illegalPoly.some(poly => poly.distanceToPoint(p) < this.treeSize / 2)
                && !trees.some(tree => distance(tree.center, p) < this.treeSize)

            let closeToSomething = illegalPoly.some(poly => poly.distanceToPoint(p) <= this.treeSize * 2)
            keep = keep && closeToSomething
            if (keep) {
                trees.push(new Tree(p, this.treeSize))
                if (trees.length >= count) return trees
                trying = tryCount
            }

        }
        return trees
    }

    inRenderBox

    draw(ctx, viewPort, {
        showStartMarkings = true, showItems = 1000, showLane = false,
        drawSensor = true
    } = {}) {
        let viewPoint = scale(viewPort.getOffset(), -1)

        for (let env of this.envelopes) {
            env.draw(ctx, {fill: '#BBB', stroke: '#BBB', lineWidth: 15});
        }

        for (let marking of this.markings) {
            if (showStartMarkings == false && marking instanceof Start) continue
            marking.draw(ctx);
        }

        for (let seg of this.graph.segments) {
            seg.draw(ctx, {dash: [10, 10], color: 'white', width: 4});
        }

        for (let seg of this.roadBorders) {
            seg.draw(ctx, {color: 'white', width: 4})
        }

        if (this.corridor)
            for (let seg of this.corridor.borders) {
                seg.draw(ctx, {color: 'red', width: 4});
            }


        ctx.globalAlpha = .2
        for (let car of this.cars) {
            car.draw(ctx, {drawSensor: false})
        }
        ctx.globalAlpha = 1
        this.bestCar?.draw(ctx, {drawSensor})
        if(!viewPoint.equal(this.#lastViewPoint)) {
            if (showItems) {
                let items = [...this.buildings, ...this.trees]
                    // .filter(item => viewPort.inRenderBox(item.base.points))
                    .filter(item => item.base.distanceToPoint(viewPoint) < showItems)
                    .sort((a, b) =>
                        b.base.distanceToPoint(viewPoint) -
                        a.base.distanceToPoint(viewPoint)
                    )
                // ITEMS IS BUILDINGS AND TREES
                for (let item of items) {
                    item.draw(ctx, viewPoint, {drawId: true})
                }
            }
            if (showLane)
                for (const seg of this.laneGuides) {
                    seg.draw(ctx, {color: 'red'})
                }
        }
        this.#lastViewPoint = viewPoint
    }

}