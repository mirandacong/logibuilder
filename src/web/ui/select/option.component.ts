import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    InjectionToken,
    Input,
    OnDestroy,
    Optional,
    Output,
    ViewEncapsulation,
} from '@angular/core'

export class LogiOptionSelectChange {
    // tslint:disable: codelyzer-template-property-should-be-public
    public constructor(
        public readonly source: LogiOptionComponent,
        /**
         * Whether the change in the option's value was a result of a user
         * action.
         */
        public readonly isUserInput = false,
    ) {}
}

interface OptionParentComponent {
    readonly disableRipple?: boolean
    readonly multiple?: boolean
}

export const LOGI_OPTION_PARENT_COMPONENT =
    new InjectionToken<OptionParentComponent>('MAT_OPTION_PARENT_COMPONENT')

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '[class.logi-option-disabled]': 'disabled',
        '[class.logi-selected]': 'selected',
        '[style.display]': 'hide ? "none" : "flex"',
        class: 'logi-option',
    },
    selector: 'logi-option',
    styleUrls: ['./option.style.scss'],
    templateUrl: './option.template.html',
})
export class LogiOptionComponent implements OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _el: ElementRef<HTMLElement>,
        @Optional() @Inject(LOGI_OPTION_PARENT_COMPONENT)
        private readonly _parent: OptionParentComponent,
    ) {}
    // tslint:disable-next-line: ext-variable-name variable-name
    public static ngAcceptInputType_disabled: BooleanInput

    @Input() public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value)
    }

    public get disabled(): boolean {
        return this._disabled
    }

    public get selected(): boolean {
        return this._selected
    }

    public get disableRipple(): boolean {
        // tslint:disable-next-line: no-double-negation
        return this._parent && !!this._parent.disableRipple
    }

    public get multiple(): boolean {
        // tslint:disable-next-line: no-double-negation
        return this._parent && !!this._parent.multiple
    }

    // tslint:disable-next-line: unknown-instead-of-any
    @Input() public value: any
    @Input() public label = ''

    public hide = false

    @Output()
    public readonly selectChange$ = new EventEmitter<LogiOptionSelectChange>()

    // tslint:disable-next-line: prefer-function-over-method no-empty
    public ngOnDestroy(): void {
    }

    @HostListener('click')
    public selectByInteraction(): void {
        if (this._disabled)
            return
        this._selected = this.multiple ? !this._selected : true
        this._cd.markForCheck()
        this.selectChange$.emit(new LogiOptionSelectChange(this, true))
    }

    public getHostElement(): HTMLElement {
        return this._el.nativeElement
    }

    public select(): void {
        if (this._selected)
            return
        this._selected = true
        this._cd.markForCheck()
    }

    public deselect(): void {
        if (!this._selected)
            return
        this._selected = false
        this._cd.markForCheck()
    }

    private _disabled = false
    private _selected = false
}
