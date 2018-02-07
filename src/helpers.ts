export function empty(collection: any[]) {
    return !collection.length;
}

export function has(collection: any[]) {
    return !empty(collection);
}

export function uppercaseFirst(word: string) {
    return word[0].toUpperCase() + word.slice(1);
}
