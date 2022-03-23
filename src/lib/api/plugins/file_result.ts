import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface FileResult {
    readonly actionType: number
    readonly logi?: Readonly<Uint8Array>
    readonly excel?: Readonly<Uint8Array>
    readonly zip?: Readonly<Uint8Array>
    readonly txt?: Readonly<Uint8Array>
}

class FileResultImpl implements Impl<FileResult> {
    public actionType!: number
    public logi?: Readonly<Uint8Array>
    public excel?: Readonly<Uint8Array>
    public zip?: Readonly<Uint8Array>
    public txt?: Readonly<Uint8Array>
}

export class FileResultBuilder extends
    Builder<FileResult, FileResultImpl> {
    public constructor(obj?: Readonly<FileResult>) {
        const impl = new FileResultImpl()
        if (obj)
            FileResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public logi(logi?: Readonly<Uint8Array>): this {
        this.getImpl().logi = logi
        return this
    }

    public excel(excel?: Readonly<Uint8Array>): this {
        this.getImpl().excel = excel
        return this
    }

    public zip(zip?: Readonly<Uint8Array>): this {
        this.getImpl().zip = zip
        return this
    }

    public txt(txt?: Readonly<Uint8Array>): this {
        this.getImpl().txt = txt
        return this
    }

    protected get daa(): readonly string[] {
        return FileResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
    ]
}

export function isFileResult(value: unknown): value is FileResult {
    return value instanceof FileResultImpl
}

export function assertIsFileResult(
    value: unknown,
): asserts value is FileResult {
    if (!(value instanceof FileResultImpl))
        throw Error('Not a FileResult!')
}
