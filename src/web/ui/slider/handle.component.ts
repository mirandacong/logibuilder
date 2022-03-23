import {BooleanInput} from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import {InputBoolean} from '@logi/src/web/ui/common/utils'
import {Subscription} from 'rxjs'

import {LogiSliderService} from './service'
import {LogiSliderTooltipDirective} from './tooltip.directive'

// tslint:disable: no-null-keyword
// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: unknown-instead-of-any no-indexable-types
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    exportAs: 'logiSliderHandle',
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '(mouseenter)': 'enterHandle()',
        '(mouseleave)': 'leaveHandle()',
    },
    preserveWhitespaces: false,
    selector: 'logi-slider-handle',
    styleUrls: ['./handle.style.scss'],
    templateUrl: './handle.template.html',
})
export class LogiSliderHandleComponent implements OnChanges, OnInit, OnDestroy {
    public constructor(
        private readonly _sliderSvc: LogiSliderService,
        private readonly _cdr: ChangeDetectorRef,
    ) {}

    // tslint:disable-next-line: ext-variable-name variable-name
    public static ngAcceptInputType_active: BooleanInput

    @Input() public vertical = false
    @Input() public reverse = false
    @Input() public offset = 0
    @Input() public value = 0
    @Input() @InputBoolean() public active = false
    // tslint:disable-next-line: ter-max-len
    @Input() public set tooltipFormatter(fn: ((value: number) => string) | undefined) {
        this._tooltipFormatter = fn
        this._updateTooltipTitle()
    }

    public get tooltipFormatter(): ((value: number) => string) | undefined {
        return this._tooltipFormatter
    }

    public tooltipTitle = ''
    public style: {[klass: string]: any} = {}
    public hovered = false

    public ngOnChanges(changes: SimpleChanges): void {
        // tslint:disable-next-line: typedef
        const {offset, value, reverse} = changes
        if (offset || reverse)
            this._updateStyle()
        if (value)
            this._updateTooltipTitle()
    }

    public ngOnInit(): void {
        this._subs.add(this._sliderSvc.listenDragEvent().subscribe(value => {
            if (!value && this._tooltip)
                this._tooltip.hide()
        }))
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    public enterHandle(): void {
        this.hovered = true
    }

    public leaveHandle(): void {
        this.hovered = false
        if (this._sliderSvc.isDragging())
            return
        this._tooltip.hide()
        this._cdr.markForCheck()
    }

    public focus(): void {
        this._handleElRef.nativeElement.focus()
    }

    @ViewChild('handle') private readonly _handleElRef!: ElementRef<HTMLElement>
    @ViewChild(LogiSliderTooltipDirective)
    private readonly _tooltip!: LogiSliderTooltipDirective
    private _subs = new Subscription()
    private _tooltipFormatter?: (value: number) => string

    private _updateTooltipTitle(): void {
        if (this.tooltipFormatter === undefined)
            return
        this.tooltipTitle = this.tooltipFormatter(this.value)
    }

    private _updateStyle(): void {
        const vertical = this.vertical
        const reverse = this.reverse
        const offset = this.offset
        const positionStyle = vertical
      ? {
          [reverse ? 'top' : 'bottom']: `${offset}%`,
          [reverse ? 'bottom' : 'top']: 'auto',
          transform: reverse ? null : 'translateY(+50%)',
      }
      : {
          [reverse ? 'right' : 'left']: `${offset}%`,
          [reverse ? 'left' : 'right']: 'auto',
          transform: `translateX(${reverse ? '+' : '-'}50%)`,
      }

        this.style = positionStyle
        this._cdr.markForCheck()
    }
}
