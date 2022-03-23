import {Builder as BaseBuilder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export abstract class SpreadsheetPayload {
    public sheet!: string
}

export class Builder<T extends SpreadsheetPayload, S extends Impl<T>>
    extends BaseBuilder<T, S> {
    public sheet(sheet: string): this {
        this.getImpl().sheet = sheet
        return this
    }

    protected get daa(): readonly string[] {
        return Builder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sheet',
    ]
}
export function isSpreadsheetPayload(
    value: unknown,
): value is SpreadsheetPayload {
    return value instanceof SpreadsheetPayload
}
