import {Error, ErrorBuilder, ErrorType, isError} from './error'
import {Token, TokenBuilder, Type} from './token'

export function lex(expr: string): readonly (Token | Error)[] {
    const lexer = new Lexer()
    return lexer.lex(expr)
}

export function lexSuccess(
    // tslint:disable-next-line: unknown-paramenter-for-type-predicate
    toks: readonly (Token | Error)[],
): toks is readonly Token[] {
    return toks.filter(isError).length === 0
}

export const EMPTY_TOKEN = new TokenBuilder().image('').type(Type.WS).build()

class Lexer {
    public lex(text: string): readonly (Token | Error)[] {
        this._stream = text
        let finish = false
        while (!finish)
            finish = this._lexFromCurrentChar()
        return this._result
    }

    private _stream!: string

    private _state = new State()

    // tslint:disable-next-line: readonly-array
    private _result: (Token | Error)[] = []

    private _tokenize(regex: RegExp, type: Type, state: DfaState): boolean {
        this._buildError()
        const slice = this._stream.substring(this._state.offset)
        const result = slice.match(regex)
        if (result === null)
            return false
        const moves = result[0].length
        const start = this._state.offset
        const end = this._state.offset + moves
        const image = this._stream.substring(start, end)
        const tok = new TokenBuilder().image(image).type(type).build()
        this._result.push(tok)
        this._state.offset += moves
        this._state.dfaState = state
        return true
    }

    private _error(regex: RegExp, type: ErrorType, state: DfaState): boolean {
        this._buildError()
        const slice = this._stream.substring(this._state.offset)
        const result = slice.match(regex)
        if (result === null)
            return false
        const moves = result[0].length
        const start = this._state.offset
        const end = this._state.offset + moves
        const image = this._stream.substring(start, end)
        const tok = new ErrorBuilder().image(image).type(type).build()
        this._result.push(tok)
        this._state.offset += moves
        this._state.dfaState = state
        return true
    }

    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    private _lexFromCurrentChar(): boolean {
        switch (this._state.dfaState) {
        case DfaState.NORMAL:
            if (this._stream === '')
                return true
            if (this._isEof()) {
                this._buildError()
                const err = new ErrorBuilder()
                    .type(ErrorType.UNEXPECTED_END)
                    .build()
                this._result.push(err)
                return true
            }
            if (this._getCurrentChar() === '(' && !this._escape()) {
                const toks = this._lexBracket()
                this._result.push(...toks)
                this._state.dfaState = DfaState.TO_READ_OP
                return false
            }
            if (this._tokenize(/^ +/, Type.WS, DfaState.NORMAL))
                return false
            if (this._tokenize(
                /^\{((\\\})|[^}{])*?\}/,
                Type.REF,
                DfaState.TO_READ_OP,
            ))
                return false
            // If an opening { does not close, We regard + - * \ ) as the stop
            // char.
            if (this._error(
                /^\{[^+\-*/^) ]+/,
                ErrorType.UNRECORGNIZED,
                DfaState.TO_READ_OP,
            ))
                return false
            if (this._tokenize(
                /^\d+([yqmd]|(hy))/i,
                Type.DATE,
                DfaState.TO_READ_OP,
            ))
                return false
            if (this._tokenize(
                /^[+-]? *?\d+\.?\d*%?/,
                Type.CONSTANT,
                DfaState.TO_READ_OP,
            ))
                return false
            if (this._tokenize(/^".*?"/, Type.STRING, DfaState.TO_READ_OP))
                return false
            if (this._tokenize(
                /^[+-]? *?\d+[eE][+-]\d+/,
                Type.CONSTANT,
                DfaState.TO_READ_OP,
            ))
                return false
            if (this._tokenize(/^NULL/i, Type.KEYWORD, DfaState.TO_READ_OP))
                return false
            if (this._tokenize(
                /^[a-zA-Z0-9\u4E00-\u9FA5]+/,
                Type.FUNC,
                DfaState.TO_READ_PARA,
            ))
                return false
            if (this._tokenize(/^[+-]/, Type.UNARY_OP, DfaState.NORMAL))
                return false
            this._setErrorStart()
            return false
        case DfaState.TO_READ_OP:
            if (this._isEof()) {
                this._buildError()
                return true
            }
            if (this._tokenize(/^ +/, Type.WS, DfaState.TO_READ_OP))
                return false
            if (this._tokenize(/^[+\-*/&]/, Type.OP, DfaState.NORMAL))
                return false
            if (this._tokenize(/^::/, Type.OP, DfaState.NORMAL))
                return false
            if (this._tokenize(/^[<>!]?=/, Type.OP, DfaState.NORMAL))
                return false
            if (this._tokenize(/^<>/, Type.OP, DfaState.NORMAL))
                return false
            if (this._tokenize(/^[<>]/, Type.OP, DfaState.NORMAL))
                return false
            if (this._tokenize(
                /^\.[a-zA-Z0-9]+/,
                Type.METHOD,
                DfaState.TO_READ_PARA,
            ))
                return false
            if (this._tokenize(
                /^\[((\\\])|[^\]])*?\]/,
                Type.SLICE,
                DfaState.TO_READ_OP,
            ))
                return false
            this._setErrorStart()
            return false
        case DfaState.TO_READ_PARA:
            if (this._isEof()) {
                this._buildError()
                const err = new ErrorBuilder()
                    .type(ErrorType.UNEXPECTED_END)
                    .build()
                this._result.push(err)
                return true
            }
            if (this._getCurrentChar() === '(' && !this._escape()) {
                this._result.push(...this._lexParas())
                this._state.dfaState = DfaState.TO_READ_OP
                return false
            }
            this._setErrorStart()
            return false
        default:
        }
        this._state.offset += 1
        return false
    }

    private _getCurrentChar(): string {
        return this._stream[this._state.offset]
    }

    // Helping to check whether the last character is the escape character.
    private _escape(): boolean {
        return this._stream[this._state.offset - 1] === '\\'
    }

    private _setErrorStart(): void {
        if (this._state.errorStart < 0)
            this._state.errorStart = this._state.offset
        this._state.offset += 1
    }

    private _buildError(): void {
        if (this._state.errorStart < 0)
            return
        const errorImage = this._stream
            .slice(this._state.errorStart, this._state.offset)
        const error = new ErrorBuilder()
            .type(ErrorType.UNRECORGNIZED)
            .image(errorImage)
            .build()
        this._result.push(error)
        this._state.errorStart = -1
    }

    private _lexBracket(): readonly (Token | Error)[] {
        this._buildError()
        if (this._getCurrentChar() !== '(')
            return []
        const s = this._state.offset
        const result: (Token | Error)[] = []
        while (!this._isEof()) {
            if (this._getCurrentChar() === '(' && !this._escape())
                this._state.openingBrackets += 1
            else if (this._getCurrentChar() === ')' && !this._escape())
                this._state.openingBrackets -= 1
            if (this._getCurrentChar() === ')' && !this._escape()
                && this._state.openingBrackets === 0) {
                const content = this._stream.slice(s + 1, this._state.offset)
                result.push(new TokenBuilder()
                    .image('(')
                    .type(Type.BRA)
                    .build())
                result.push(...lex(content))
                result
                    .push(new TokenBuilder().image(')').type(Type.KET).build())
                this._state.offset += 1
                return result
            }
            this._state.offset += 1
        }
        result.push(new TokenBuilder().image('(').type(Type.BRA).build())
        // In this case, we can not find the closing bracket ')'.
        // We assume that the closing bracket should appear at the last. Lex
        // the string.
        const errors: Error[] = []
        // const lack = this._state.openingBrackets
        const image = this._stream.slice(s + 1, this._state.offset)
        result.push(...lex(image))
        const last = result.pop()
        if (isError(last) &&
            last.type === ErrorType.UNRECORGNIZED &&
            last.image === ')')
            result.push(new TokenBuilder().image(')').type(Type.KET).build())
        else if (last !== undefined) {
            result.push(last)
            errors.push(
                new ErrorBuilder().type(ErrorType.EXPECTED).image(')').build(),
            )
        }
        result.push(...errors)
        return result
    }

    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    private _lexParas(): readonly (Token | Error)[] {
        this._buildError()
        if (this._getCurrentChar() !== '(')
            return []
        const result: (Token | Error)[] = [new TokenBuilder()
            .image('(')
            .type(Type.BRA)
            .build()]
        let s = this._state.offset
        let inRef = false
        while (!this._isEof()) {
            if (this._getCurrentChar() === '(' && !this._escape() && !inRef)
                this._state.openingBrackets += 1
            else if (this._getCurrentChar() === ')' &&
                !this._escape() && !inRef)
                this._state.openingBrackets -= 1
            if (this._getCurrentChar() === '{' && !this._escape() && !inRef) {
                inRef = true
                this._state.offset += 1
                continue
            }
            if (this._getCurrentChar() === '}' && !this._escape() && inRef) {
                inRef = false
                this._state.offset += 1
                continue
            }
            if (this._getCurrentChar() === ',' && !this._escape() && !inRef
                && this._state.openingBrackets === 1) {
                const content = this._stream.slice(s + 1, this._state.offset)
                result.push(...lex(content))
                result.push(new TokenBuilder()
                    .image(',')
                    .type(Type.COMMA)
                    .build())
                s = this._state.offset
            }
            if (this._getCurrentChar() === ')'
                && this._state.openingBrackets === 0) {
                const content = this._stream.slice(s + 1, this._state.offset)
                result.push(...lex(content))
                result
                    .push(new TokenBuilder().image(')').type(Type.KET).build())
                this._state.offset += 1
                return result
            }
            this._state.offset += 1
        }
        const errors: Error[] = []
        const image = this._stream.slice(s + 1, this._state.offset)
        result.push(...lex(image))
        const last = result.pop()
        if (isError(last) &&
            last.type === ErrorType.UNRECORGNIZED &&
            last.image === ')')
            result.push(new TokenBuilder().image(')').type(Type.KET).build())
        else if (last !== undefined) {
            result.push(last)
            errors.push(
                new ErrorBuilder().type(ErrorType.EXPECTED).image(')').build(),
            )
        }
        result.push(...errors)
        return result
    }

    private _isEof(): boolean {
        return this._state.offset >= this._stream.length
    }
}

class State {
    public dfaState: DfaState = DfaState.NORMAL
    // tslint:disable-next-line: readonly-array
    public openingBrackets = 0
    public offset = 0
    public errorStart = -1
}

const enum DfaState {
    NORMAL,
    TO_READ_OP,
    TO_READ_PARA,
}
