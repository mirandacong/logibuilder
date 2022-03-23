import Long from 'long'
export function bytesToMb(bytes: Long): number {
    const num = bytes.toNumber()
    return num / (1024 * 1024)
}
