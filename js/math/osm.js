import Point from "../primitives/point.js";
import {degToRad, domainMap} from "../utils/algebra-math-utils.js";
import Segment from "../primitives/segment.js";

export function parseRoads(data) {
    let {cos, PI} = Math
    let nodes = data.elements.filter(e => e.type == "node")

    let lats = nodes.map(n => n.lat)
    let lons = nodes.map(n => n.lon)

    let latMin = Math.min(...lats)
    let latMax = Math.max(...lats)

    let lonMin = Math.min(...lons)
    let lonMax = Math.max(...lons)

    let deltaLat = latMax - latMin
    let deltaLon = lonMax - lonMin
    let ar = deltaLon / deltaLat
    let height = deltaLat * 111320 * 20
    let width = height * ar * cos(degToRad(latMax))

    let points = []
    let segments = []
    let pMap = new Map()
    for (let node of nodes) {
        let y = domainMap(node.lat, [latMin, latMax], [height /2, - height/2 ])
        let x = domainMap(node.lon, [lonMin, lonMax], [ - width / 2, width /2])
        let point = new Point(x, y)
        point.id = node.id
        points.push(point)
        pMap.set(node.id, point)
    }

    let ways = data.elements.filter(e => e.type == "way")
    for (let way of ways) {
        let ids = way.nodes
        for (let i = 0; i < ids.length - 1; i++) {
            let p1 = pMap.get(ids[i])
            let p2 = pMap.get(ids[i + 1])
            let oneWay = way.tags.oneway || way.tags.lanes == 1
            segments.push(new Segment(p1, p2, oneWay))
        }
    }

    return {points, segments}

}

