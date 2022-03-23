import {Error, ErrorType} from './error'
import {isToken, Token, Type} from './token'

export function toToksText(
    parts: readonly (readonly (Token | Error)[])[],
): string {
    const partStr: string[] = []
    parts.forEach((p: readonly (Token | Error)[], index: number) => {
        const tokensStr = getTokensString(p)
        const indexStr = `@ ${(index + 1).toString()} @`
        partStr.push([indexStr, tokensStr].join('\n') + '\n')
    })
    return partStr.join('\n')
}

function getTokensString(tokens: readonly (Token | Error)[]): string {
    const strs: string[] = []
    tokens.forEach((t: Token | Error) => {
        if (isToken(t)) {
            strs.push(`${Type[t.type]} '${t.image}'`)
            return
        }
        strs.push(`Err ${ErrorType[t.type]} '${t.image}'`)
    })
    return strs.join('\n')
}
