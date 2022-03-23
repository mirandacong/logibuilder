import {ActionBuilder, ButtonGroupBuilder} from '@logi/src/web/ui/common/action'
import {
    TextLine,
    TextLineBuilder,
    TextSpanBuilder,
} from '@logi/src/web/ui/common/content'
import {of} from 'rxjs'

import {
    BaseDialogData,
    BaseDialogDataBuilder,
    BaseDialogDataImpl,
} from './base_dialog_data'

export interface TextDialogData extends BaseDialogData {
    readonly lines: readonly TextLine[]
}

class TextDialogDataImpl extends BaseDialogDataImpl implements TextDialogData {
    public lines: readonly TextLine[] = []
}

export class TextDialogDataBuilder extends
    BaseDialogDataBuilder<TextDialogData, TextDialogDataImpl> {
    public constructor(obj?: Readonly<TextDialogData>) {
        const impl = new TextDialogDataImpl()
        if (obj)
            TextDialogDataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public lines(lines: readonly TextLine[]): this {
        this.getImpl().lines = lines
        return this
    }

    protected get daa(): readonly string[] {
        return TextDialogDataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['title']
}

export function isTextDialogData(value: unknown): value is TextDialogData {
    return value instanceof TextDialogDataImpl
}

export function assertIsTextDialogData(
    value: unknown,
): asserts value is TextDialogData {
    if (!(value instanceof TextDialogDataImpl))
        throw Error('Not a TextDialogData!')
}

export function plainConfirmDialogData(
    title: string,
    text: string,
): TextDialogData {
    const span = new TextSpanBuilder().text(text).build()
    const line = new TextLineBuilder().spans([span]).build()
    const buttonGroup = new ButtonGroupBuilder()
        .secondary([
            new ActionBuilder().text('取消').run(() => of(false)).build(),
        ])
        .primary(new ActionBuilder().text('确定').run(() => of(true)).build())
        .build()
    return new TextDialogDataBuilder()
        .title(title)
        .lines([line])
        .buttonGroup(buttonGroup)
        .build()
}

export function plainPromptDialogData(
    title: string,
    text: string,
): TextDialogData {
    const span = new TextSpanBuilder().text(text).build()
    const line = new TextLineBuilder().spans([span]).build()
    const buttonGroup = new ButtonGroupBuilder()
        .primary(new ActionBuilder().text('关闭').run(()=>of(true)).build())
        .build()
    return new TextDialogDataBuilder()
        .buttonGroup(buttonGroup)
        .title(title)
        .lines([line])
        .build()
}
