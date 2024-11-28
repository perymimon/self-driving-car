export function cloneInstance(instance) {
    var cloned = null
    try {
        cloned = structuredClone(instance);
    } catch (err) {
        console.warn('fallback using JSON it triggered')
        cloned = JSON.parse(JSON.stringify(instance));
    }
    restorePrototypes(instance, cloned)
    return cloned;
}

function restorePrototypes(original, cloned, map = new WeakMap()) {
    if (!(original instanceof Object)) {
        return;
    }

    if (map.has(original)) {
        return map.get(original); // return the saved ref of cloned
    }

    map.set(original, cloned);

    // Set the prototype of the cloned object to match the original
    const originalProto = original.constructor.prototype;
    Object.setPrototypeOf(cloned, originalProto);

    if (original instanceof Map) {
        const originalEntries = Array.from(original.entries());
        const clonedEntries = Array.from(cloned.entries());

        for (let i = 0; i < originalEntries.length; i++) {
            const [originalKey, originalValue] = originalEntries[i];
            const [clonedKey, clonedValue] = clonedEntries[i];

            // Restore prototypes for keys and values
            restorePrototypes(originalKey, clonedKey, map);
            restorePrototypes(originalValue, clonedValue, map);
        }
    } else if (original instanceof Set) {
        const originalValues = Array.from(original.values());
        const clonedValues = Array.from(cloned.values());

        for (let i = 0; i < originalValues.length; i++) {
            const originalValue = originalValues[i];
            const clonedValue = clonedValues[i];

            // Restore prototypes for values
            restorePrototypes(originalValue, clonedValue, map);
        }
    } else if (Array.isArray(original)) {
        for (let i = 0; i < original.length; i++) {
            restorePrototypes(original[i], cloned[i], map);
        }
    } else {
        const keys = Reflect.ownKeys(cloned);
        for (let key of keys) {
            const originalValue = original[key];
            const clonedValue = cloned[key];
            if (originalValue instanceof Object) {
                cloned[key] = restorePrototypes(originalValue, clonedValue, map);
            }
        }
    }
    return cloned
}
