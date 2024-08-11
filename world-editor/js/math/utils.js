import Point from "../primitives/point.js";
import Segment from "../primitives/segment.js";

export const eps = 0.001

export function getNearestPoint(point, points, threshold = Number.MAX_SAFE_INTEGER) {
    if (points.length === 0) return null;

    let nearest = points.reduce((sel, p) => {
        let nearest = distance(point, sel)
        let current = distance(point, p)
        return nearest < current ? sel : p
    })
    return distance(point, nearest) > threshold ? null : nearest
}

export function getNearestSegment(point, segments, threshold) {
    if (segments.length === 0) return null;

    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest = null
    for (let seg of segments) {
        let dist = seg.distanceToPoint(point)
        if (dist < minDist && dist < threshold) {
            minDist = dist
            nearest = seg
        }
    }
    return nearest
}

export function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

export function subtract(p1, p2) {
    return new Point(p1.x - p2.x, p1.y - p2.y)
}

export function add(p1, p2) {
    return new Point(p1.x + p2.x, p1.y + p2.y)
}

export function scale(p, scalar = 1) {
    return new Point(p.x * scalar, p.y * scalar)
}

export function normalize(p) {
    return scale(p, 1 / magnitude(p))
}

export function magnitude(p) {
    return Math.hypot(p.x, p.y)
}

export function average(p1, p2) {
    return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
}

export function dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
}

export function translate(point, angle, offset) {
    return new Point(
        point.x + Math.cos(angle) * offset,
        point.y + Math.sin(angle) * offset
    )
}

export function angle(p) {
    return Math.atan2(p.y, p.x)
}

export function radToDeg(rad) {
    return (180 / Math.PI) * rad
}

export function lerp(A, B, t) {
    return A + (B - A) * t
}

export function lerp2D(A, B, t) {
    return new Point(
        lerp(A.x, B.x, t),
        lerp(A.y, B.y, t),
    )
}

export function getIntersection(seg1, seg2) {
    var {p1: A, p2: B} = seg1
    var {p1: C, p2: D} = seg2
    /*
     Ix = Ax + (Bx-Ax)t = Cx + (Dx-Cx)u
     Iy = Ay + (By-Ay)y = Cy + (Dy-Cy)u

     Ax+ (Bx-Ax)t = Cx + (Dx-Cx)u | -Cx
     Ax-Cx + (Bx-Ax)t = (Dx-Cx)u

     Ay+ (By-Ay)t = Cy + (Dy-Cy)u | -Cy
     Ay-Cy + (By-Ay)t = (Dy-Cy)u  | * (Dx-Cx)

     (Dx-Cx)(Ay-Cy) + (Dx-Cx)(By-Ay)t = (Dy-Cy)(Dx-Cx)u
     (Dx-Cx)(Ay-Cy) + (Dx-Cx)(By-Ay)t =(Dy-Cy)( Ax-Cx + (Bx-Ax)t )
     (Dx-Cx)(Ay-Cy) + (Dx-Cx)(By-Ay)t =(Dy-Cy)( Ax-Cx ) + (Dy-Cy)(Bx-Ax)t | - (Dy-Cy)( Ax-Cx )
                                                                        | (Dx-Cx)(By-Ay)t
     (Dx-Cx)(Ay-Cy) - (Dy-Cy)( Ax-Cx ) = (Dy-Cy)(Bx-Ax)t - (Dx-Cx)(By-Ay)t

     t = (Dx-Cx)(Ay-Cy) - (Dy-Cy)( Ax-Cx ) / (Dy-Cy)(Bx-Ax) - (Dx-Cx)(By-Ay)

    */

    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x)
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y)
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y)
    const eps = 0.001;
    const maxeps = 0.999
    if (Math.abs(bottom) > eps) {
        const t = tTop / bottom
        const u = uTop / bottom
        if ((t >= 0 && t <= 1) && (u >= 0 && u <= 1))
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t > maxeps ? 1 : (t < eps ? 0 : t)
            }
    }

    return null


}

export function polysIntersect(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++)
        for (let j = 0; j < poly2.length; j++) {
            let A = poly1[i]
            let B = poly1[(i + 1) % poly1.length]
            let C = poly2[j]
            let D = poly2[(j + 1) % poly2.length]

            const touch = getIntersection(A, B, C, D)
            if (touch) return true
        }
    return false
}


export function random(min, max, integer = true) {
    let result = Math.random() * (max - min + 1) + min;
    if (integer)
        return Math.floor(result)
    return result
}

export function pseudoRandom(sid) {
    sid = String(sid / 17)
    let hash = Array.from(sid).reduce((sum, c) => sum * 31 + sid.charCodeAt(c))
    return Math.abs(Math.cos(Number(hash)));
}

export function isPointIntoPolygon(point, poly) {
    const outerPoint = new Point(-10000, -10000)
    const crossSegment = new Segment(outerPoint, point)
    let intersectionCount = 0;
    for (const seg of poly.segments) {
        const int = crossSegment.intersection(seg)
        if (int) intersectionCount++
    }
    return intersectionCount % 2 == 1
}

export function getFake3dPoint(point, viewPoint, height) {
    const dir = normalize(subtract(point, viewPoint));
    const dist = distance(point, viewPoint);
    const scalar = Math.atan(dist / 300) / (Math.PI / 2);
    return add(point, scale(dir, height * scalar));
}

// export function getFake3dPoint(point,viewPoint, height){
//     let deep = 10
//     let s = deep / (deep + height)
//     const dir = subtract(point, viewPoint);
//     console.log(s);
//     return add(point, scale(dir, s));
// }
export function inRange(min, max, value) {
    if (value <= min) return false
    if (value >= max) return false
    return true
}

export function perpendicular(p) {
    return new Point(-p.y, p.x)
}

export function domainMap(v, domain, limit) {
    let [ds, de] = domain
    let [ls, le] = limit

    return (v - ds) / (de - ds) * (le - ls) + ls
}

export function degToRad(deg) {
    return deg * Math.PI / 180
}

