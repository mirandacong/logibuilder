import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    EventEmitter,
    Component,
    ContentChild,
    HostBinding,
    Input,
    Output,
    OnDestroy,
} from '@angular/core'
import {isHTMLInputElement} from '@logi/src/web/base/utils'
import {Subscription} from 'rxjs'
import {debounceTime} from 'rxjs/operators'

import {LogiInputDirective} from './input.directive'

import {ActiveInputService} from './active_input.service'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-active-input',
    styleUrls: ['./active_input.style.scss'],
    templateUrl: './active_input.template.html',
})
export class LogiActiveInputComponent implements AfterContentInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _activeInputSvc: ActiveInputService,
    ) {}

    @Input() public icon = ''
    @Input() public iconTooltip = ''
    /**
     * The type is used to distinguish diffrent value form.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Input() public type: any
    @Output() public readonly valueChange$ = new EventEmitter<string>()
    @HostBinding('class.logi-focused') public focused = false

    public active = false

    public ngAfterContentInit(): void {
        if (!this._inputDirective)
            // tslint:disable-next-line: no-throw-unless-asserts
            throw Error('logi-active-input need to wrap a logi-input')
        this._subs.add(this._inputDirective.isFocused$().subscribe(focused => {
            this.focused = focused
            this._cd.markForCheck()
        }))
        this._subs.add(this._inputDirective
            .input$()
            .pipe(debounceTime(500))
            .subscribe(e => {
                if (!isHTMLInputElement(e.target))
                    return
                this.valueChange$.next(e.target.value)
            }))
    }

    public ngOnDestroy(): void {
        this._activeInputSvc.cancelActiveInput(this)
        this._subs.unsubscribe()
    }

    public getInput(): LogiInputDirective {
        return this._inputDirective
    }

    public markForCheck(): void {
        this._cd.markForCheck()
    }

    public onClick(): void {
        this._activeInputSvc.toggleActiveInput(this)
    }

    @ContentChild(LogiInputDirective)
    private readonly _inputDirective!: LogiInputDirective
    private readonly _subs = new Subscription()
}
