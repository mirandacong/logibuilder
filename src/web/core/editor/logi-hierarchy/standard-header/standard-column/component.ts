import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
} from '@angular/core'
import {
    Column,
    FormulaBearer,
    isColumnBlock,
    NodeType,
} from '@logi/src/lib/hierarchy/core'
import {getDisplayUnit} from '@logi/src/lib/intellisense'
import {renderContent} from '@logi/src/lib/visualizer'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'
import {LabelType} from '@logi/src/web/core/editor/logi-hierarchy/label'
import {Subject} from 'rxjs'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-standard-column',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class StandardColumnComponent implements OnDestroy {
    @Input() public set col(n: Readonly<Column>) {
        if (n === undefined)
            return
        this.node = n
    }
    public node!: Readonly<FormulaBearer>
    @Input() public lastNodeInParent!: boolean
    @Input() public inDialog!: boolean
    public labelType = LabelType

    public showLabelContent = true

    public trackBy = trackByFnReturnItem

    public getEquations(expr: string): string {
        const unit = getDisplayUnit(expr, this.node)
        return renderContent(unit)
    }

    public ngOnDestroy(): void {
        this._destroyed$.next()
        this._destroyed$.complete()
    }

    public labelNums(): string {
        const len = this.node.labels.length
        if (!len)
            return ''
        return `${len} 标签`
    }

    public columnBlockChild(): boolean {
        const cb = this.node.findParent(NodeType.COLUMN_BLOCK)
        return cb !== undefined && isColumnBlock(cb)
    }

    public isEmpty(): boolean {
        return this.node.expression.trim().length === 0
    }
    private _destroyed$ = new Subject<void>()
}
