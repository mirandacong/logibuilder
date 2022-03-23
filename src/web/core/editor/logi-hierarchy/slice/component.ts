import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    Input,
    OnDestroy,
} from '@angular/core'
import {FormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'
import {Slice} from '@logi/src/web/core/editor/logi-hierarchy/base'

import {NameService} from './name'
import {OptionService} from './option'

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [NameService, OptionService],
    selector: 'logi-editor-slice',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SliceComponent extends Slice implements OnDestroy {
    @Input() public set sliceExpr (slice: Readonly<SliceExpr>) {
        if (slice === undefined)
            return
        this.slice = slice
    }
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    public slice!: Readonly<SliceExpr>
    /**
     * The fb which contains the slice.
     * Input this field for can not get the container of slice from `SliceExpr`.
     */
    @Input() public node!: Readonly<FormulaBearer>

    public isMenuOpen = false

    public ngOnDestroy (): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }

    public addSlice (): void {
        const index = this.node.sliceExprs.indexOf(this.slice)
        this.nodeEditSvc.addSlice(true, index + 1)
    }

    public deleteSlice (): void {
        this.nodeEditSvc.removeSlice(this.slice)
    }

    public isFirstSlice (): boolean {
        return this.node.sliceExprs.indexOf(this.slice) === 0
    }

    public isEmpty (): boolean {
        return this.slice.expression.trim().length === 0
    }

    public onMenuOpen (): void {
        this.isMenuOpen = true
        this._cd.markForCheck()
    }

    public onMenuClosed (): void {
        this.isMenuOpen = false
        this._cd.markForCheck()
    }
}
