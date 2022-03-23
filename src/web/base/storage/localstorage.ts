// tslint:disable: no-localstorage no-type-assertion
export function setLocalStorage(key: string, value: string | number): void {
    localStorage.setItem(key, value.toString())
}

export function getLocalStorage(key: string): string | undefined {
    const value = localStorage.getItem(key)
    if (value === null)
        return
    return value
}

export function getLengthOfLocalStorage(): number {
    return localStorage.length
}

export function removeLocalStorage(key: string): void {
    return localStorage.removeItem(key)
}

export function clearLocalStorage(): void {
    localStorage.clear()
}
