import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ElementRef,
    Input,
    OnDestroy,
    Renderer2,
} from '@angular/core'
import {Subscription} from 'rxjs'

import {LogiInputDirective} from './input.directive'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-textarea-count',
    host: {
        class: 'logi-textarea-count',
    },
    template: `
    <ng-content select='textarea[logi-input]'></ng-content>
`,
})
export class LogiTextareaCountComponent implements AfterContentInit, OnDestroy {
    constructor(
        private readonly _renderer: Renderer2,
        private readonly _el: ElementRef<HTMLElement>,
    ) {}
    @Input() maxCount = 0

    ngAfterContentInit(): void {
        if (!this._inputDirective)
            // tslint:disable-next-line: no-throw-unless-asserts
            throw new Error('logi-textarea-count: could not find textarea[logi-input]')
        const control = this._inputDirective.ngControl
        if (!control)
            return
        this._subs.add(control.valueChanges?.subscribe(() => {
            const value = this._inputDirective.ngControl.value
            this._updateCount(value)
        }))
    }

    ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    @ContentChild(LogiInputDirective, {static: true})
    private _inputDirective!: LogiInputDirective
    private _subs = new Subscription()

    private _updateCount(value: string): void {
        const count = value.length
        const label = this.maxCount > 0 ?
            `${count}/${this.maxCount}` : `${count}`
        this._renderer.setAttribute(this._el.nativeElement, 'data-count', label)
    }
}
