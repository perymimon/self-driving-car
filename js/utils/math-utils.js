import {eps} from "./algebra-math-utils.js";

export function isZero(value) {
    return Math.abs(value) < eps;
}

export function reduceToZero(value, friction) {
    if (Math.abs(value) < friction) return 0
    if (value > 0) return value - friction;
    if (value < 0) return value + friction;
    return 0
}

export function clap(value, min, max) {
    return Math.max(Math.min(value, max), min)
}

