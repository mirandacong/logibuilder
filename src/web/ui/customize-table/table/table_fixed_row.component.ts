/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {BooleanInput} from '@angular/cdk/coercion'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import {InputBoolean} from '@logi/src/web/ui/common/utils'
import {BehaviorSubject, Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {LogiTableStyleService} from '../service/style.service'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    selector: 'tr[logi-table-fixed-row], tr[logiExpand]',
    templateUrl: './table_fixed_row.template.html',
})
export class LogiTableFixedRowComponent implements OnInit, OnDestroy,
AfterViewInit {
    public constructor(
        private readonly _renderer: Renderer2,
        private readonly _logiTableStyleService?: LogiTableStyleService,
    ) {}
    public static ngAcceptInputType_logiNoIndent: BooleanInput
    @ViewChild('tdelement') public tdElement!: ElementRef
    @ViewChild('fixelement', {static: false}) public fixElement!: ElementRef

    @Input() @InputBoolean() public logiNoIndent = false

    public hostWidth$ = new BehaviorSubject<number | null>(null)
    public ngOnInit(): void {
        if (this._logiTableStyleService)
            this._logiTableStyleService.hostWidth().subscribe(width => {
                this.hostWidth$.next(this.logiNoIndent ? null : width)
            })
    }

    public ngAfterViewInit(): void {
        if (!this._logiTableStyleService)
            return
        this._logiTableStyleService
            .columnCount()
            .pipe(takeUntil(this._destroy$))
            .subscribe(count => {
                this._renderer.setAttribute(
                    this.tdElement.nativeElement,
                    'colspan',
                    `${count}`,
                )
                this._setStyle()
            })
    }

    public ngOnDestroy(): void {
        this._destroy$.next()
        this._destroy$.complete()
    }
    private _destroy$ = new Subject()

    private _setStyle(): void {
        if (!this.logiNoIndent)
            return
        this._renderer.setStyle(this.tdElement.nativeElement, 'padding', `${0}`)
        if (this.fixElement !== undefined) {
            this._renderer
                .setStyle(this.fixElement.nativeElement, 'padding', `${0}`)
            this._renderer
                .setStyle(this.fixElement.nativeElement, 'margin', `${0}`)
        }
    }
}
