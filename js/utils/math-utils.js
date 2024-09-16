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

export function getMaxItem(array, valueFn) {
    var bestValue = valueFn(array.at(0))
    return array.reduce((bestItem, item) => {
        let value = valueFn(item)
        if (value - bestValue <= 0 ) return bestItem
        bestValue = value
        return item
    })
}

export function getMinItem(array, valueFn) {
    var bestValue = valueFn(array.at(0))
    return array.reduce((bestItem, item) => {
        let value = valueFn(item)
        if (bestValue - value <= 0 ) return bestItem
        bestValue = value
        return item
    })
}

