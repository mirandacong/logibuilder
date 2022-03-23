import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Action} from './action'

export interface ButtonGroup {
    readonly primary?: Action
    readonly secondary: readonly Action[]
}

class ButtonGroupImpl implements Impl<ButtonGroup> {
    public primary?: Action
    public secondary: readonly Action[] = []
}

export class ButtonGroupBuilder extends Builder<ButtonGroup, ButtonGroupImpl> {
    public constructor(obj?: Readonly<ButtonGroup>) {
        const impl = new ButtonGroupImpl()
        if (obj)
            ButtonGroupBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public primary(primary: Action): this {
        this.getImpl().primary = primary
        return this
    }

    public secondary(secondary: readonly Action[]): this {
        this.getImpl().secondary = secondary
        return this
    }

    protected get daa(): readonly string[] {
        return ButtonGroupBuilder.__DAA_PROPS__
    }
}

export function isButtonGroup(value: unknown): value is ButtonGroup {
    return value instanceof ButtonGroupImpl
}

export function assertIsButtonGroup(
    value: unknown,
): asserts value is ButtonGroup {
    if (!(value instanceof ButtonGroupImpl))
        throw Error('Not a Button!')
}
