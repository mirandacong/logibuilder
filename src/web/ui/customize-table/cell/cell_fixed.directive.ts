/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {Directive, ElementRef, Input, OnChanges, Renderer2} from '@angular/core'
import {Subject} from 'rxjs'

@Directive({
    selector: 'td[logiRight],th[logiRight],td[logiLeft],th[logiLeft]',
    host: {
        '[class.logi-table-cell-fix-right]': 'isFixedRight',
        '[class.logi-table-cell-fix-left]': 'isFixedLeft',
        '[style.position]': "isFixed? 'sticky' : null",
    },
})
export class LogiCellFixedDirective implements OnChanges {
    public constructor(private renderer: Renderer2, private elementRef: ElementRef) {}
    @Input() public logiRight: string | boolean = false
    @Input() public logiLeft: string | boolean = false
    @Input() public colspan: number | null = null
    @Input() public colSpan: number | null = null
    public changes$ = new Subject<void>()
    public isAutoLeft = false
    public isAutoRight = false
    public isFixedLeft = false
    public isFixedRight = false
    public isFixed = false

    public setAutoLeftWidth(autoLeft: string | null): void {
        this.renderer.setStyle(this.elementRef.nativeElement, 'left', autoLeft)
        this.renderer.setStyle(this.elementRef.nativeElement, 'z-index', 2)
    }

    public setAutoRightWidth(autoRight: string | null): void {
        this.renderer
            .setStyle(this.elementRef.nativeElement, 'right', autoRight)
        this.renderer.setStyle(this.elementRef.nativeElement, 'z-index', 2)
    }

    public setIsFirstRight(isFirstRight: boolean): void {
        this.setFixClass(isFirstRight, 'logi-table-cell-fix-right-first')
    }

    public setIsLastLeft(isLastLeft: boolean): void {
        this.setFixClass(isLastLeft, 'logi-table-cell-fix-left-last')
    }

    public ngOnChanges(): void {
        this.setIsFirstRight(false)
        this.setIsLastLeft(false)
        this.isAutoLeft = this.logiLeft === '' || this.logiLeft === true
        this.isAutoRight = this.logiRight === '' || this.logiRight === true
        this.isFixedLeft = this.logiLeft !== false
        this.isFixedRight = this.logiRight !== false
        this.isFixed = this.isFixedLeft || this.isFixedRight
        const validatePx = (value: string | boolean): string | null => {
            if (typeof value === 'string' && value !== '')
                return value

            return null
        }
        this.setAutoLeftWidth(validatePx(this.logiLeft))
        this.setAutoRightWidth(validatePx(this.logiRight))
        this.changes$.next()
    }

    private setFixClass(flag: boolean, className: string): void {
    // the setFixClass function may call many times, so remove it first.
        this.renderer.removeClass(this.elementRef.nativeElement, className)

        if (flag)
            this.renderer.addClass(this.elementRef.nativeElement, className)
    }
}
