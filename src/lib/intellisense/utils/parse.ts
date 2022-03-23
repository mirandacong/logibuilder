import {
    Error,
    ErrorType,
    isError,
    isToken,
    Token,
    TokenType,
} from '@logi/src/lib/dsl/lexer/v2'

/**
 * Find the index of the editting token according to the offset.
 *
 * NOTE: export this function only for test.
 */
export function findEditingToken(
    offset: number,
    tokens: readonly (Token | Error)[],
): number {
    let count = 0
    // tslint:disable-next-line: no-loop-statement
    for (let i = 0; i < tokens.length; i += 1) {
        const tokenLen = tokens[i].image.length
        count += tokenLen
        if (offset <= count)
            return i
    }

    return tokens.length - 1
}

/**
 * Find the editing block which contains the editting token.
 *
 * When the user input is correct, we are supposed to suggest refnames and
 * function names.
 */
// tslint:disable-next-line:max-func-body-length
export function findEditingBlock(
    offset: number,
    tokens: readonly Readonly<Token | Error>[],
): ModifyRange {
    const ignoreTypes = [
        TokenType.OP,
        TokenType.UNARY_OP,
        TokenType.BRA,
        TokenType.KET,
        TokenType.COMMA,
        TokenType.DOUBLE_COLON,
        TokenType.WS,
    ]
    const idx = findEditingToken(offset, tokens)
    const curr = tokens[idx]
    if (isToken(curr) && ignoreTypes.includes(curr.type))
        return new ModifyRange(-1, -1)
    if (isError(curr) &&
        (curr.type !== ErrorType.UNRECORGNIZED || !curr.image.startsWith('{')))
        return new ModifyRange(-1, -1)
    return new ModifyRange(idx, idx)
}

/**
 * Indicate the range of tokens involved in this suggestion.
 *
 * If input is `SUM({A: book/sheet | /home}` and the cursor is placed at '|',
 * in this case, we should use  `A: book/sheet/home` to suggest path
 * or selection. So we can build this class to indicate it.
 */
export class ModifyRange {
    public constructor(
        /**
         * The index of the start token of the list.
         *
         * In the case below, `{` is the start token.
         */
    public readonly start: number,
        /**
         * The index of the end token of the list.
         *
         * In the case below, `}` is the end token.
         */
    public readonly end: number,

    ) {}
}
