export function isNetwork(): boolean {
    return window.navigator.onLine
}

export const OFFLINE_MESSAGE = '网络请求失败，请检查网络设置'
