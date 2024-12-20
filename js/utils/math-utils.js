import {eps} from "./algebra-math-utils.js";

export function isCloseZero(value) {
    return Math.abs(value) < eps;
}

export function reduceToZero(value, friction) {
    if (Math.abs(value) < friction) return 0
    if (value > 0) return value - friction;
    if (value < 0) return value + friction;
    return 0
}

export function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min)
}

/** get angle -inf to inf and return angle -PI to PI */
export function simpleAngle(angle) {
    let fullCircle = Math.PI * 2
    let halfCircle = Math.PI
    angle = (angle + halfCircle) % fullCircle //gpt
    angle += (angle < 0 ? halfCircle : -halfCircle)
    return angle
}

console.assert(simpleAngle(Math.PI + 1) === -Math.PI + 1)
console.assert(simpleAngle(Math.PI - 1) === Math.PI - 1)
console.assert(simpleAngle(2 * Math.PI - 1) === -1)

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
