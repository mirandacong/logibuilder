import {EventEmitter, TemplateRef} from '@angular/core'

export type PopoverPositionX = 'before' | 'after'
export type PopoverPositionY = 'above' | 'below'

export interface LogiPopoverPanel {
    readonly positionX?: PopoverPositionX
    readonly positionY?: PopoverPositionY
    readonly templateRef: TemplateRef<unknown>
    readonly mouseenter$: EventEmitter<void>
    readonly mouseleave$: EventEmitter<void>
}
