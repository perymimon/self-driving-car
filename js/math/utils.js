import Point from "../primitives/point.js";

export function getNearestPoint(point, points, threshold = Number.MAX_SAFE_INTEGER) {
    if (points.length === 0) return null;

    let nearest = points.reduce((sel, p) => {
        let nearest = distance(point, sel)
        let current = distance(point, p)
        return nearest < current ? sel : p
    })
    return distance(point, nearest) > threshold ? null : nearest
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