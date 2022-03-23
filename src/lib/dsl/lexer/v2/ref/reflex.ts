import {isRefError, RefError, RefErrorBuilder, RefErrorType} from './error'
import {RefToken, RefTokenBuilder, RefTokenType} from './token'

export const NAME_ILLEGAL_CHAR: readonly string[] = ['@', '}', '!' , '[']

class Lexer {
    public lex(text: string): readonly (RefToken | RefError)[] {
        this._stream = text
        let finish = false
        while (!finish)
            finish = this._lexFromCurrentChar()
        return this._result
    }

    private _stream!: string
    // tslint:disable-next-line: readonly-array
    private _result: (RefToken | RefError)[] = []
    private _state = new State()

    // tslint:disable-next-line: cyclomatic-complexity max-func-body-length
    private _lexFromCurrentChar(): boolean {
        if (this._isEof()) {
            this._buildError()
            return true
        }
        switch (this._state.dfaState) {
        case DfaState.START:
            if (this._tokenize(/^ +/, RefTokenType.WS, DfaState.START))
                return false
            return !this._tokenize(
                /^\{/,
                RefTokenType.REF_START,
                DfaState.TO_READ_PART,
            )
        case DfaState.TO_READ_PART:
            if (this._tokenize(/^ +/, RefTokenType.WS, DfaState.TO_READ_PART))
                return false
            if (this._tokenize(
                /^((ALL)|(THIS))(?=})/i,
                RefTokenType.KEYWORD,
                DfaState.END,
            ))
                return false
            if (this._tokenize(
                /^((\\[\[!@\}])|[^\[!@\}])+/,
                RefTokenType.PART,
                DfaState.AFTER_READ_PART,
            ))
                return false
            if (this._tokenize(
                /^!/,
                RefTokenType.SPLITTER,
                DfaState.TO_READ_PART,
                new RefTokenBuilder().image('').type(RefTokenType.PART).build(),
            ))
                return false
            if (this._tokenize(
                /^\}/,
                RefTokenType.REF_END,
                DfaState.END,
                new RefTokenBuilder().image('').type(RefTokenType.PART).build(),
            ))
                return false
            this._setErrorStart()
            return false
        case DfaState.AFTER_READ_PART:
            if (this
                ._tokenize(/^ +/, RefTokenType.WS, DfaState.AFTER_READ_PART))
                return false
            if (this._tokenize(
                /^\[\[/,
                RefTokenType.LABEL_START,
                DfaState.TO_READ_LABEL,
            ))
                return false
            if (this
                ._tokenize(/^!/, RefTokenType.SPLITTER, DfaState.TO_READ_PART))
                return false
            if (this._tokenize(
                /^@(((\\[\[!@\}])|[^\[!@\}])+)/,
                RefTokenType.ALIAS,
                DfaState.TO_READ_END,
            ))
                return false
            if (this._tokenize(/^\}/, RefTokenType.REF_END, DfaState.END))
                return false
            this._setErrorStart()
            return false
        case DfaState.END:
            if (this._isEof())
                return true
            if (this._tokenize(/^ +/, RefTokenType.WS, DfaState.END))
                return false
            this._setErrorStart()
            return false
        case DfaState.TO_READ_LABEL:
            if (this._tokenize(/^ +/, RefTokenType.WS, DfaState.TO_READ_LABEL))
                return false
            if (this._tokenize(
                /^[a-zA-Z0-9 &|%]+/,
                RefTokenType.LABEL,
                DfaState.TO_READ_COMMA,
            ))
                return false
            this._setErrorStart()
            return false
        case DfaState.TO_READ_COMMA:
            if (this._tokenize(/^ +/, RefTokenType.WS, DfaState.TO_READ_COMMA))
                return false
            if (this._tokenize(
                /^,/,
                RefTokenType.LABEL_SPLITTER,
                DfaState.TO_READ_LABEL,
            ))
                return false
            if (this._tokenize(
                /^\]\]/,
                RefTokenType.LABEL_END,
                DfaState.AFTER_READ_LABEL,
            ))
                return false
            this._setErrorStart()
            return false
        case DfaState.AFTER_READ_LABEL:
            if (this
                ._tokenize(/^ +/, RefTokenType.WS, DfaState.AFTER_READ_LABEL))
                return false
            if (this
                ._tokenize(/^!/, RefTokenType.SPLITTER, DfaState.TO_READ_PART))
                return false
            if (this._tokenize(/^\}/, RefTokenType.REF_END, DfaState.END))
                return false
            this._setErrorStart()
            return false
        case DfaState.TO_READ_END:
            if (this._tokenize(/^ +/, RefTokenType.WS, DfaState.TO_READ_END))
                return false
            if (this._tokenize(/^\}/, RefTokenType.REF_END, DfaState.END))
                return false
            this._setErrorStart()
            return false
        default:
        }
        this._state.offset += 1
        return false
    }

    private _isEof(): boolean {
        return this._state.offset >= this._stream.length
    }

    private _buildError(): void {
        if (this._state.errorStart < 0)
            return
        const errorImage = this._stream
            .slice(this._state.errorStart, this._state.offset)
        const error = new RefErrorBuilder()
            .type(RefErrorType.UNRECOGNIZED)
            .image(errorImage)
            .build()
        this._result.push(error)
        this._state.errorStart = -1
    }

    /**
     * Try to consume the coming chars using the regex.
     *
     * If true:
     *  - consume the chars
     *  - using these chars to build the token of the given type
     *  - Change the state
     *  - push the pushBeforeToken and the built token
     * If false:
     *  - keep everythings as they are.
     */
    private _tokenize(
        // tslint:disable-next-line: max-params
        regex: RegExp,
        type: RefTokenType,
        state: DfaState,
        pushBefore?: RefToken,
    ): boolean {
        this._buildError()
        const slice = this._stream.substring(this._state.offset)
        const result = slice.match(regex)
        if (result === null)
            return false
        const moves = result[0].length
        const start = this._state.offset
        const end = this._state.offset + moves
        const image = this._stream.substring(start, end)
        const trimmed = type === RefTokenType.WS ? image :
            image.replace(/ +$/, '')
        const tok = new RefTokenBuilder().image(trimmed).type(type).build()
        if (pushBefore !== undefined)
            this._result.push(pushBefore)
        this._result.push(tok)
        this._state.offset += moves
        this._state.dfaState = state
        const delta = image.length - trimmed.length
        if (delta > 0) {
            let i = ''
            while (i.length < delta)
                i += ' '
            this._result.push(
                new RefTokenBuilder().image(i).type(RefTokenType.WS).build(),
            )
        }
        return true
    }

    private _setErrorStart(): void {
        if (this._state.errorStart < 0)
            this._state.errorStart = this._state.offset
        this._state.offset += 1
    }
}

export function reflex(ref: string): readonly (RefToken | RefError)[] {
    const lexer = new Lexer()
    return lexer.lex(ref)
}

export function reflexSuccess(
    // tslint:disable-next-line: unknown-paramenter-for-type-predicate
    refResult: readonly (RefToken | RefError)[],
): refResult is readonly RefToken[] {
    return refResult.filter(isRefError).length === 0
}

const enum DfaState {
    AFTER_READ_LABEL,
    AFTER_READ_PART,
    END,
    START,
    TO_READ_AT,
    TO_READ_COMMA,
    TO_READ_END,
    TO_READ_INDEX,
    TO_READ_LABEL,
    TO_READ_PART,
}

class State {
    public dfaState: DfaState = DfaState.START
    // tslint:disable-next-line: readonly-array
    public openingBrackets = 0
    public offset = 0
    public errorStart = -1
}
