import {Builder} from '@logi/base/ts/common/builder'
import Long from 'long'
import {isLong} from '@logi/src/web/base/utils'
import {Unit, BASE, UNITS} from './unit'
export function formatBytes(bytes: Long | number, decimals = 2): Size {
    const b = isLong(bytes) ? bytes.toNumber() : bytes
    if (b === 0)
        return new SizeBuilder().size(0).bytes(0).unit(Unit.KB).build()
    const dm = decimals < 0 ? 0 : decimals
    const i = Math.floor(Math.log(b) / Math.log(BASE))
    let size = parseFloat((b / Math.pow(BASE, i)).toFixed(dm))
    const min = Math.pow(0.1, decimals)
    if (size <= min)
        size = 0
    return new SizeBuilder().bytes(b).unit(UNITS[i]).size(size).build()
}
export interface Size {
    readonly size: number
    readonly unit: Unit
    readonly bytes: number
    toString(): string
}

class SizeImpl implements Size {
    public size = 0
    public unit = Unit.BYTES
    public bytes = 0
    toString(): string {
        return `${this.size}${this.unit}`
    }
}

export class SizeBuilder extends Builder<Size, SizeImpl> {
    public constructor(obj?: Readonly<Size>) {
        const impl = new SizeImpl()
        if (obj)
            SizeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public size(size: number): this {
        this.getImpl().size = size
        return this
    }

    public unit(unit: Unit): this {
        this.getImpl().unit = unit
        return this
    }

    public bytes(bytes: number): this {
        this.getImpl().bytes = bytes
        return this
    }
}

export function isSize(value: unknown): value is Size {
    return value instanceof SizeImpl
}

export function assertIsSize(value: unknown): asserts value is Size {
    if (!(value instanceof SizeImpl))
        throw Error('Not a Size!')
}
