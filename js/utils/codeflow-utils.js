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