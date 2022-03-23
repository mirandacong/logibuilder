/* eslint-disable @typescript-eslint/no-explicit-any */
import {Builder} from '@logi/base/ts/common/builder'

export interface ButtonStatus {
    readonly disabled: boolean
    readonly show: boolean
    readonly text: string
    readonly data: any
    updateDisabled(disabled: boolean): void
    updateShow(show: boolean): void
    updateData(data: any): void
    reset(): void
    updateText(text: string): void
}

class ButtonStatusImpl implements ButtonStatus {
    public disabled = true
    public show = false
    public text = ''
    public data!: any
    updateData(data: any): void {
        this.data = data
    }

    public updateDisabled(disabled: boolean): void {
        this.disabled = disabled
    }

    public updateShow(show: boolean): void {
        this.show = show
    }

    public reset(): void {
        this.disabled = true
        this.show = false
    }

    public updateText(text: string): void {
        this.text = text
    }
}

export class ButtonStatusBuilder
    extends Builder<ButtonStatus, ButtonStatusImpl> {
    public constructor(obj?: Readonly<ButtonStatus>) {
        const impl = new ButtonStatusImpl()
        if (obj)
            ButtonStatusBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public disabled(disabled: boolean): this {
        this.getImpl().disabled = disabled
        return this
    }

    public show(show: boolean): this {
        this.getImpl().show = show
        return this
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    public data(data: any): this {
        this.getImpl().data = data
        return this
    }
}

export function isButtonStatus(value: unknown): value is ButtonStatus {
    return value instanceof ButtonStatusImpl
}

export function assertIsButtonStatus(
    value: unknown,
): asserts value is ButtonStatus {
    if (!(value instanceof ButtonStatusImpl))
        throw Error('Not a ButtonStatus!')
}
