export async function wait(time) {
    return new Promise((res, rej) => {
        setTimeout(res, time)
    })
}

// return hash that detect that array change order
export function arrayOrderHash(arr, key) {
    return arr.map(item => item[key])
        .reduce((hash, num, index) => {
            return hash + num * (index + 1);
        }, 0);
}

export function waitToEvent(object, eventName, timeout = 1000) {
    const {resolve, reject, promise} = Promise.withResolvers()
    object.addEventListener(eventName, resolve, {once: true})
    if (timeout) wait(timeout).then(reject)
    return promise
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

export class Counter{
    constructor(count) {
        this.steps = count
        this.reset()
    }
    counting(){
        this.currentCount -= 1
        return this.currentCount <= 0
    }
    countingIf(condition){
        if(condition)
            return this.counting()
        else
            return this.reset()
    }
    reset(){
        this.currentCount = this.steps
        return false
    }

}