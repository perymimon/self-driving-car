export async function wait(time) {
    return new Promise((res, rej) => {
        setTimeout(res, time)
    })
}

export function arrayOrderHash(arr, key) {
    return arr.map(item => item[key])
        .reduce((hash, num, index) => {
            return hash + num * (index + 1);
        }, 0);
}