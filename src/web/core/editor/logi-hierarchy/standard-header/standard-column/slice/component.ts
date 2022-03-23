import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {Column, SliceExpr} from '@logi/src/lib/hierarchy/core'
import {getDisplayUnit} from '@logi/src/lib/intellisense'
import {renderContent} from '@logi/src/lib/visualizer'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-slice-part',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SlicePartComponent {
    @Input() public node!: Readonly<Column>

    public getEquations (slice: SliceExpr): string {
        const sliceUnit = getDisplayUnit(slice.expression, this.node)
        return renderContent(sliceUnit)
    }
}
