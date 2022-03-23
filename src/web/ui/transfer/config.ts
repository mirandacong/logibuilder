import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
export interface TransferConfig {
    readonly toLeft: string,
    readonly toRight: string
    readonly rightTitle: string
    readonly leftTitle: string
}

class TransferConfigImpl implements Impl<TransferConfig> {
    public toLeft = '删除'
    public toRight = '添加'
    public rightTitle = ''
    public leftTitle = ''
}

export class TransferConfigBuilder extends
Builder<TransferConfig, TransferConfigImpl> {
    public constructor(obj?: Readonly<TransferConfig>) {
        const impl = new TransferConfigImpl()
        if (obj)
            TransferConfigBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public toLeft(toLeft: string): this {
        this.getImpl().toLeft = toLeft
        return this
    }

    public toRight(toRight: string): this {
        this.getImpl().toRight = toRight
        return this
    }

    public rightTitle(rightTitle: string): this {
        this.getImpl().rightTitle = rightTitle
        return this
    }

    public leftTitle(leftTitle: string): this {
        this.getImpl().leftTitle = leftTitle
        return this
    }
}

export function isTransferConfig(value: unknown): value is TransferConfig {
    return value instanceof TransferConfigImpl
}

export function assertIsTransferConfig(
    value: unknown,
): asserts value is TransferConfig {
    if (!(value instanceof TransferConfigImpl))
        throw Error('Not a TransferConfig!')
}
