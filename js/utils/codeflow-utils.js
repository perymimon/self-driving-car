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

export class TrackCounter {
    constructor(count) {
        this.steps = count
        this.reset()
    }

    counting() {
        this.currentCount -= 1
        return this.currentCount <= 0
    }

    trackDown(condition) {
        return condition ? this.counting() : this.reset()
    }

    reset() {
        this.currentCount = this.steps
        return false
    }

}

export function downloadJSON(json, defFilename = 'default', extension = 'json') {
    var filename = prompt('Enter the file name:', defFilename);
    if (!filename) return false
    if (!filename.endsWith(`.${extension}`)) filename += `.${extension}`
    var a = document.createElement('a')
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
    var filename = localStorage.getItem(memoName) ?? defaultPath;
    return {
        content: await fetchJSONFile(filename),
        filename,
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

export function extractFormData(form) {
    const formDataObj = {};

    // Iterate over all form elements
    for (let element of form.elements) {
        // Skip elements without a name or disabled elements
        if (!element.name || element.disabled) continue;

        // Handle different input types
        switch (element.type) {
            case 'checkbox':
                // For checkboxes, store the checked status
                formDataObj[element.name] = element.checked;
                break;
            case 'radio':
                if ((element.name in formDataObj)) break;
                // For radio buttons, store the selected value
                formDataObj[element.name] = form.elements[element.name]?.value ?? null;
                break;
            default:
                // For other input types, store the value
                formDataObj[element.name] = element.value;
                break;
        }
    }
    return formDataObj
}

export function $get(object, path, defaultValue) {
    // If the path is a string, convert it to an array
    // Handle both dot notation and bracket notation
    path = path === 'string' ? path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.') : []
    var value = path.reduce((o, i) => o?.[i], object);
    return value ?? defaultValue
}

export function getValueByKey(obj, key = '') {
    if (!key) return obj;
    return key.split('.').reduce((o, i) => o?.[i], obj);
}

export function getPathByKey(obj, key) {
    var path = []
    if (!key) return path
    key.split('.').reduce((o, i) => {
        path.push(o)
        return o?.[i]
    }, obj);
    return path;
}

export function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}

//todo: not review or tested
export function createElement(selector = '') {
    // Match and create the tag
    const tagName = selector.match(/^[a-z]+/i)?.[0] || 'div';
    const element = document.createElement(tagName);

    // Set ID if specified
    const idMatch = selector.match(/#([\w-]+)/);
    if (idMatch) element.id = idMatch[1];

    // Set classes if specified
    const classMatches = selector.match(/\.[\w-]+/g);
    if (classMatches) {
        element.classList.add(...classMatches.map(cls => cls.slice(1)));
    }

    // Set attributes if specified
    const attrMatches = [...selector.matchAll(/\[([\w-]+)(?:=("[^"]*"|'[^']*'|[^\]]+))?\]/g)];
    attrMatches.forEach(match => {
        const attrName = match[1];
        let attrValue = match[2] || '';
        attrValue = attrValue.replace(/^["']|["']$/g, ''); // Remove quotes if present
        element.setAttribute(attrName, attrValue);
    });

    return element;
}

// export function entries(obj) {
//     let properties = new Map()
//     var propertiesObj = obj
//     while (propertiesObj !== null) {
//         for (let key of Object.getOwnPropertyNames(propertiesObj)){
//             if(key == '__proto__') continue;
//             var value = obj[key]
//             if(typeof value === 'function') continue;
//             properties.set(key, value);
//         }
//         propertiesObj = Object.getPrototypeOf(propertiesObj);
//     }
//     return Array.from(properties);
// }

export function entries(obj) {
    if (isObjIterable(obj)) {
        return Array.from(obj)
    }

    let properties = new Map()
    var propertiesObjs = [obj, Object.getPrototypeOf(obj)]

    for (let propertyObj of propertiesObjs) {
        for (let key of Object.getOwnPropertyNames(propertyObj)) {
            if (key == '__proto__') continue;
            var value = obj[key]
            if (typeof value === 'function') continue;
            properties.set(key, value);
        }
    }
    return Array.from(properties);
}

export function isObjIterable(obj) {
    if (typeof obj !== 'object') return false;
    return obj != null && typeof obj[Symbol.iterator] === 'function';
}

export function run(fn) {
    return fn()
}

export function camelToSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

export function splitCamelCase(str) {
    return str.split(/(?=[A-Z])/).map(word => word.toLowerCase());
}