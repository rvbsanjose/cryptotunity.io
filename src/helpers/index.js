export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}