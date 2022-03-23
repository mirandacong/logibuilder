import {Token, TokenBuilder, Type} from './token'
/**
 * {ref}[(hist AND last_year) OR qr]
 *        ^                       ^
 */
// tslint:disable-next-line: max-func-body-length
export function lex(expr: string): readonly Token[] {
    const tokens: Token[] = []
    let buffer: string[] = []
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < expr.length; i += 1) {
        let curr = expr[i]
        let cnt = 0
        if (curr === ' ' && buffer.length > 0) {
            const tok = buildToken(buffer.join(''))
            buffer = []
            tokens.push(tok)
        }
        while (curr === ' ' && i < expr.length) {
            if (buffer.length > 0) {
                const tok = buildToken(buffer.join(''))
                buffer = []
                tokens.push(tok)
            }
            cnt += 1
            i += 1
            curr = expr[i]
        }
        if (cnt > 0) {
            const ws = new TokenBuilder()
                .type(Type.WS)
                .image(' '.repeat(cnt))
                .build()
            tokens.push(ws)
            cnt = 0
        }
        if (curr === '(') {
            if (buffer.length > 0) {
                const tok = buildToken(buffer.join(''))
                buffer = []
                tokens.push(tok)
            }
            const braTok = new TokenBuilder().image('(').type(Type.BRA).build()
            tokens.push(braTok)
            continue
        }
        if (curr === ')') {
            if (buffer.length > 0) {
                const tok = buildToken(buffer.join(''))
                buffer = []
                tokens.push(tok)
            }
            const ketTok = new TokenBuilder().image(')').type(Type.KET).build()
            tokens.push(ketTok)
            continue
        }
        buffer.push(curr)
    }
    if (buffer.length > 0)
        tokens.push(buildToken(buffer.join('')))
    const result: Token[] = []
    // Filter the whitespace tokens. Some of them are meaningless, and others
    // are part of value.
    let values: Token[] = []
    tokens.forEach((tok: Token, i: number): void => {
        if (tok.type === Type.VALUE ||
            (tok.type === Type.WS && tokens[i + 1]?.type === Type.VALUE &&
            tokens[i - 1]?.type === Type.VALUE)) {
            values.push(tok)
            return
        }
        if (values.length > 0) {
            const img = values
                .map((t: Token): string => t.image)
                .join('')
                .trim()
            if (img.length > 0)
                result.push(
                    new TokenBuilder().image(img).type(Type.VALUE).build(),
                )
            values = []
        }
        result.push(tok)
    })
    const image = values.map((t: Token): string => t.image).join('').trim()
    if (image.length > 0)
        result.push(new TokenBuilder().image(image).type(Type.VALUE).build())
    return result
}

function buildToken(image: string): Token {
    switch (image.toUpperCase()) {
    case 'AND':
        return new TokenBuilder().image(image).type(Type.AND).build()
    case 'OR':
        return new TokenBuilder().image(image).type(Type.OR).build()
    case 'NOT':
        return new TokenBuilder().image(image).type(Type.NOT).build()
    default:
    }
    if (image.match(/^__(.*?)__$/))
        return new TokenBuilder().type(Type.UNARY).image(image).build()
    return new TokenBuilder().type(Type.VALUE).image(image).build()
}
