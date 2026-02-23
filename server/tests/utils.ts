export function map(items: any[], changeItem: (item: any) => any): any[] {
    const result = [];
    for (let i = 0; i < items.length; i++) {
        result.push(changeItem(items[i]));
    }
    return result;
}

export function filter(items: any[], callback: (item: any) => boolean): any[] {
    const result = [];
    for (let i = 0; i < items.length; i++) {
        if (callback(items[i])) {
            result.push(items[i]);
        }
    }
    return result;
}
