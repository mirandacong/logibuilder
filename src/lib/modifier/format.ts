import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Format {
    readonly currency: Currency
    readonly percent: boolean
    readonly thousandsSeparator: boolean
    readonly decimalPlaces: number
    getFormatter(): string
}

class FormatImpl implements Impl<Format> {
    public currency = Currency.NONE
    public percent = false
    public thousandsSeparator = true
    public decimalPlaces = 2
    public getFormatter(): string {
        let dec = this.decimalPlaces > 0 ? '.' : ''
        for (let i = 0; i < this.decimalPlaces; i += 1)
            dec += '0'
        const ts = this.thousandsSeparator ? '#,##' : ''
        const percent = this.percent ? '%' : ''
        const base = `${this.currency}${ts}0${dec}${percent}`
        return `${base};(${base})`
    }
}

export class FormatBuilder extends Builder<Format, FormatImpl> {
    public constructor(obj?: Readonly<Format>) {
        const impl = new FormatImpl()
        if (obj)
            FormatBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public currency(currency: Currency): this {
        this.getImpl().currency = currency
        return this
    }

    public percent(percent: boolean): this {
        this.getImpl().percent = percent
        return this
    }

    public thousandsSeparator(thousandsSeparator: boolean): this {
        this.getImpl().thousandsSeparator = thousandsSeparator
        return this
    }

    public decimalPlaces(decimalPlaces: number): this {
        this.getImpl().decimalPlaces = decimalPlaces
        return this
    }
}

export function isFormat(value: unknown): value is Format {
    return value instanceof FormatImpl
}

export function assertIsFormat(value: unknown): asserts value is Format {
    if (!(value instanceof FormatImpl))
        throw Error('Not a Format!')
}

// tslint:disable-next-line: const-enum
export enum Currency {
    NONE = '',
    CNY = '¥',
    EUR = '€',
    USD = '$',
}

// tslint:disable-next-line: unknown-paramenter-for-type-predicate
export function isCurrency(key: string): key is Currency {
    // tslint:disable-next-line: no-object
    return Object
        .keys(Currency)
        .map((k: string): string => Reflect.get(Currency, k))
        .includes(key)
}
