import Polygon from "../primitives/polygon.js";
import Point from "../primitives/point.js";

export function generateFaces(poly1, poly2) {
    var sides = []
    var len = poly1.points.length
    for (var i = 0; i < len; i++) {
        sides.push(new Polygon([
            poly1.points[i],
            poly1.points[(i + 1) % len],
            poly2.points[(i + 1) % len],
            poly2.points[i],
        ]))
    }
    return sides
}

export function extrude(face1, {x = 0, y = 0, z = 0} = {}) {
    debugger
    var face2 = new Polygon(
        face1.points.map(p => new Point(
            p.x + x, p.y + y, p.z + z
        ))
    )
    var sides = generateFaces(face1, face2)

    return [face1, face2,...sides]

}