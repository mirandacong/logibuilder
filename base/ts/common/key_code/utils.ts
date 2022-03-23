function getUserAgent(): string {
    return navigator.userAgent
}

function getPlatform(): string {
    return navigator.platform
}

export function isFirefox(): boolean {
    return (getUserAgent().indexOf('Firefox') >= 0)
}

export function isWebkit(): boolean {
    return getUserAgent().indexOf('AppleWebKit') >= 0
}

export function isChrome(): boolean {
    return getUserAgent().indexOf('Chrome') >= 0
}

export function isMac(): boolean {
    return getPlatform().indexOf('Macintosh') >= 0
}

export function isLinux(): boolean {
    return getPlatform().indexOf('Linux') >= 0
}

export function isWindows(): boolean {
    return getPlatform().indexOf('Windows') >= 0
}
