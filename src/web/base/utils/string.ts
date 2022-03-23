/**
 * convert a fullwidth string to halfwidth.
 */
export function toHalfWidth(str: string): string {
    return str.normalize('NFKC')
}
