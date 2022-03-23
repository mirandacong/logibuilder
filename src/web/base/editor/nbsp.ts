const NBSP_CHAR_CODE = 160
const SPANCE_CHAR_CODE = 32

export function replaceNbsp(text: string): string {
    const reg = new RegExp(String.fromCharCode(NBSP_CHAR_CODE), 'g')
    return text.replace(reg, String.fromCharCode(SPANCE_CHAR_CODE))
}
