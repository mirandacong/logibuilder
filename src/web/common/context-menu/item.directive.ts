import {Highlightable} from '@angular/cdk/a11y'
import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
} from '@angular/core'

import {BooleanItemType} from './item'

// tslint:disable: unknown-instead-of-any
@Directive({
    selector: '[logi-context-menu-item]',
})
export class ContextMenuItemDirective implements Highlightable {
    public constructor(
        public readonly template: TemplateRef<{ readonly item: unknown }>,
        public readonly elementRef: ElementRef,
    ) {}

    public get disabled(): boolean {
        return this.passive ||
      this.divider ||
      !this.evaluateIfFunction(this.enabled, this.currentItem)
    }

    @Input() public subMenu?: any
    @Input() public childMenuClass: string | undefined = ''
    @Input() public divider = false
    @Input() public text = ''
    @Input() public showToolTip?: boolean
    @Input() public enabled: BooleanItemType = true
    @Input() public passive = false
    @Input() public visible: BooleanItemType = true
    @Output() public readonly execute:
    EventEmitter<{ event: Event, item: any }> = new EventEmitter()

    public currentItem: unknown
    public isActive = false

    // tslint:disable-next-line: prefer-function-over-method
    public evaluateIfFunction(value: BooleanItemType, item: unknown): boolean {
        if (value instanceof Function)
            return value(item)
        return value
    }

    public setActiveStyles(): void {
        this.isActive = true
    }

    public setInactiveStyles(): void {
        this.isActive = false
    }

    public triggerExecute(item: any, $event: MouseEvent | KeyboardEvent): void {
        if (!this.evaluateIfFunction(this.enabled, item))
            return
        // tslint:disable-next-line: no-type-assertion
        this.execute.emit({item, event: $event} as
        {readonly event: Event, readonly item: any})
    }
}
