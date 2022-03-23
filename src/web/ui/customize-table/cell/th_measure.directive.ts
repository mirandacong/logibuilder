/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import {
    Directive,
    ElementRef,
    Input,
    OnChanges,
    Renderer2,
    SimpleChanges,
} from '@angular/core'
import {Subject} from 'rxjs'

export function isNil(value: unknown): value is null | undefined {
    return typeof value === 'undefined' || value === null
}

@Directive({
    selector: 'th',
})
export class LogiThMeasureDirective implements OnChanges {
    public constructor(private renderer: Renderer2, private elementRef: ElementRef) {}
    public changes$ = new Subject()
    @Input() public logiWidth: string | null = null
    @Input() public colspan: string | number | null = null
    @Input() public colSpan: string | number | null = null
    @Input() public rowspan: string | number | null = null
    @Input() public rowSpan: string | number | null = null
    get validColSpan(): number {
        return (this.colSpan && +this.colSpan)
            || (this.colspan && +this.colspan) || 1
    }

    get validRowSpan(): number {
        return (this.rowSpan && +this.rowSpan)
            || (this.rowspan && +this.rowspan) || 1
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const {logiWidth, colspan, rowspan, colSpan, rowSpan} = changes
        if (colspan || colSpan) {
            const col = this.colspan || this.colSpan
            if (!isNil(col))
                this.renderer.setAttribute(
                    this.elementRef.nativeElement,
                    'colspan',
                    `${col}`,
                )
            else
        this.renderer.removeAttribute(this.elementRef.nativeElement, 'colspan')
        }
        if (rowspan || rowSpan) {
            const row = this.rowspan || this.rowSpan
            if (!isNil(row))
                this.renderer.setAttribute(
                    this.elementRef.nativeElement,
                    'rowspan',
                    `${row}`,
                )
            else
        this.renderer.removeAttribute(this.elementRef.nativeElement, 'rowspan')
        }
        if (logiWidth || colspan)
            this.changes$.next()
    }
}
