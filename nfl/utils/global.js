export const getRequest = async (url) => {
    return await fetch(url).then(res => res.json()).then(data => { return data; });
}

export const getNestedProperty = (data, keys, allowUndefined=false) => {
    let current = data;
    let prevKey = null;
    const errorMessage = `Key '${keys.join(".")}' does not exist.`

    for (const key of keys) {
        if (current === null || current === undefined) throw new Error(`${errorMessage} Missing ${prevKey}.${key}.`);
        current = current[key];
        prevKey = key;
    }

    if (current === undefined && !allowUndefined) throw new Error(errorMessage);
    return current;
}

export const validateData = (data, keys) => {
    for (const key of keys) {
        if (data[key] === null || data[key] === undefined) {
            throw new Error(`Missing data field '${key}': ${JSON.stringify(data, null, 2)}`);
        }
    }
}