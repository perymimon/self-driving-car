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
        if (value - bestValue <= 0) return bestItem
        bestValue = value
        return item
    })
}

export function getMinItem(array, valueFn) {
    var bestValue = valueFn(array.at(0))
    return array.reduce((bestItem, item) => {
        let value = valueFn(item)
        if (bestValue - value <= 0) return bestItem
        bestValue = value
        return item
    })
}

export class Counter {
    constructor(count) {
        this.steps = count
        this.reset()
    }

    counting() {
        this.currentCount -= 1
        return this.currentCount <= 0
    }

    countingIf(condition) {
        if (condition)
            return this.counting()
        else
            return this.reset()
    }

    reset() {
        this.currentCount = this.steps
        return false
    }

}

export function downloadJSON(json, filename = 'default.json') {
    let a = document.createElement('a')
    a.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(json))}`)
    a.setAttribute('download', filename)
    a.click()
}

export async function readJsonFile(file, memoName) {
    var {promise, resolve, reject} = Promise.withResolvers()
    localStorage.setItem(memoName, file.name)
    if (!file) {
        reject('No File selected')
        alert('No File selected')
        return
    }
    let reader = new FileReader()
    reader.onload = (evt) => {
        let fileContent = evt.target.result
        let jsonData = JSON.parse(fileContent)

        resolve(jsonData)

    }
    reader.readAsText(file)
    return promise
}

export async function fetchJSONFile(fileName) {
    var res = await fetch(fileName)
    return await res.json()
}

export async function fetchLastFile(memoName, defaultPath) {
    var filename = localStorage.getItem(memoName);
    if (filename)
        return fetchJSONFile(filename)
    else {
        return fetchJSONFile(defaultPath)
    }
}

export function onElementResize(element, callback) {
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            callback(entry.contentRect, entry.target);
        }
    });
    var rect = element.getBoundingClientRect()
    callback(rect, element);
    resizeObserver.observe(element);
    return resizeObserver; // Return observer in case you want to disconnect later
}