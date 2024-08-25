export function readJsonFile(file, memoName) {
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
    var json = await res.json()
    return json
}

export async function fetchLastFile(memoName, defaultPath) {
    var filename = localStorage.getItem(memoName);
    if (filename)
        return fetchJSONFile(filename)
    else{
        return fetchJSONFile(defaultPath)
    }
}