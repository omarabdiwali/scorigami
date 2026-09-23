export const LIMIT = 16;
export const getRequest = async (url) => {
    return await fetch(url).then(res => res.json()).then(data => { return data; });
}

export const getNestedProperty = (data, keys, allowUndefined=false) => {
    let current = data;
    let prevKey = null;
    const errorMessage = `Key '${keys.join(".")}' does not exist.`

    for (const key of keys) {
        if (current === null || current === undefined) {
            if (allowUndefined) return undefined;
            else throw new Error(`${errorMessage} Missing ${prevKey}.${key}.`);
        }
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

export const ReloadIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" enableBackground="new 0 0 32 32" width="32" height="32">
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" d="M25.7 10.9C23.9 7.4 20.2 5 16 5c-4.7 0 -8.6 2.9 -10.2 7"/>
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" d="M6.2 21c1.8 3.5 5.5 6 9.8 6 4.7 0 8.6 -2.9 10.2 -7"/>
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" points="26,5 26,11 20,11 " d="M26 5L26 11L20 11"/>
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" points="6,27 6,21 12,21 " d="M6 27L6 21L12 21"/>
        </svg>
    )
}