import {BooleanInput} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core'
import {SafeAny} from '@logi/src/web/ui/core'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.logi-option-activated]': 'activated && !disabled',
        '[class.logi-option-disabled]': 'disabled',
        '[class.logi-option-selected]': 'selected && !disabled',
        '[style.display]': 'hide ? "none" : "flex"',
        class: 'logi-inner-option',
    },
    selector: 'logi-inner-option',
    styleUrls: ['./inner-option.component.scss'],
    templateUrl: './inner-option.component.html',
})
export class LogiInnerOptionComponent implements OnInit, OnChanges, OnDestroy {
    public constructor(
        private readonly _el: ElementRef<HTMLElement>,
    ) {}
    // tslint:disable-next-line: ext-variable-name variable-name
    public static ngAcceptInputType_disabled: BooleanInput

    @Input() selectedValues: readonly SafeAny[] = []
    @Input() template: TemplateRef<SafeAny> | null = null
    @Input() value: SafeAny | null = null
    @Input() activatedValue: SafeAny | null = null
    @Input() label: string | null = null
    @Input() multiple = false
    @Input() disabled = false
    @Input() compareWith!: (o1: SafeAny, o2: SafeAny) => boolean
    @Output() readonly click$ = new EventEmitter<SafeAny>()

    selected = false
    activated = false
    public hide = false
    public content = ''

    ngOnChanges(changes: SimpleChanges): void {
        const {value, activatedValue, selectedValues}: SimpleChanges = changes
        if (value || selectedValues)
            this.selected = this.selectedValues.some(v =>
                this.compareWith(v, this.value))
        if (value || activatedValue)
            this.activated = this.compareWith(this.activatedValue, this.value)
    }

    ngOnInit(): void {
        this.content = this.label ?? (typeof this.value === 'string' ? this.value : '')
    }

    // tslint:disable-next-line: prefer-function-over-method no-empty
    ngOnDestroy(): void {
    }

    @HostListener('click')
    public selectByInteraction(): void {
        if (this.disabled)
            return
        this.click$.next(this.value)
    }

    public getHostElement(): HTMLElement {
        return this._el.nativeElement
    }
}
