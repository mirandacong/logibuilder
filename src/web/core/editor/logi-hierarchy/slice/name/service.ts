import {Injectable} from '@angular/core'
import {Observable, Subject} from 'rxjs'

import {Span, SpanBuilder, SpanType} from './span'

@Injectable()
export class NameService {
    public init(sliceName: string): void {
        this._currText = sliceName.split(' ').map(s => {
            const operators = ['and', 'or', 'not']
            const type = operators.includes(
                s.toLocaleLowerCase(),
            ) ? SpanType.OPERATOR : SpanType.NAME
            return new SpanBuilder()
                .text(this._transTypeName(s))
                .type(type)
                .build()
        })
        this._textChange$.next(this._currText)
    }

    public getNameList(): string {
        let list = ''
        if (this._currText.length < 1)
            return list
        this._currText.forEach(s => {
            if (s.type === SpanType.NAME) {
                list = list + `${s.text} `
                return
            }
            switch (s.text.toLocaleUpperCase().trim()) {
            case '与':
            case 'AND':
                list = list + 'AND '
                break
            case '或':
            case 'OR':
                list = list + 'OR '
                break
            case '非':
            case 'NOT':
                list = list + 'NOT '
                break
            default:
            }
        })
        return list
    }

    public remove(span: Span): void {
        const index = this._currText.indexOf(span)
        if (index === -1)
            return
        this._currText.splice(index, 1)
        this._textChange$.next(this._currText)
    }

    public clean(): void {
        this._currText = []
        this._textChange$.next(this._currText)
    }

    public listenSpansChange$(): Observable<readonly Span[]> {
        return this._textChange$
    }

    public reset(text: string): void {
        this._currText = [new SpanBuilder()
            .text(text)
            .type(SpanType.NAME)
            .build()]
        this._textChange$.next(this._currText)
    }

    public setName(text: string, type: SpanType, index?: number): void {
        const newSpan = new SpanBuilder().text(text).type(type).build()
        if (index === undefined)
            this._currText.push(newSpan)
        else
            this._currText.splice(index, 0, newSpan)
        this._textChange$.next(this._currText)
    }

    // tslint:disable-next-line: readonly-array
    public setCurrtText(spans: Span[]): void {
        this._currText = spans
    }

    public getCurrText(): readonly Span[] {
        return this._currText
    }
    private _textChange$ = new Subject<readonly Span[]>()
    // tslint:disable-next-line: readonly-array
    private _currText: Span[] = []

    // tslint:disable-next-line: prefer-function-over-method
    private _transTypeName(name: string): string {
        let n = name
        switch (name.toLocaleUpperCase().trim()) {
        case '与':
        case 'AND':
            n = '与'
            break
        case '或':
        case 'OR':
            n = '或'
            break
        case '非':
        case 'NOT':
            n = '非'
            break
        default:
        }
        return n
    }
}
