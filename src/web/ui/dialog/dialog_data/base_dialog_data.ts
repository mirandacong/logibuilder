import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {ButtonGroup} from '@logi/src/web/ui/common/action'

export interface BaseDialogData {
    readonly title: string
    readonly buttonGroup: ButtonGroup
}

export abstract class BaseDialogDataImpl implements Impl<BaseDialogData> {
    public title!: string
    public buttonGroup!: ButtonGroup
}

export class BaseDialogDataBuilder<T extends BaseDialogData, S extends Impl<T>>
extends Builder<T, S> {
    public title(title: string): this {
        this.getImpl().title = title
        return this
    }

    public buttonGroup(group: ButtonGroup): this {
        this.getImpl().buttonGroup = group
        return this
    }

    protected get daa(): readonly string[] {
        return BaseDialogDataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'title',
        'buttonGroup',
    ]
}

export function isBaseDialogData(value: unknown): value is BaseDialogData {
    return value instanceof BaseDialogDataImpl
}

export function assertIsBaseDialogData(
    value: unknown,
): asserts value is BaseDialogData {
    if (!(value instanceof BaseDialogDataImpl))
        throw Error('Not a BaseDialogData!')
}
