import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
} from '@angular/core'
import {Column} from '@logi/src/lib/hierarchy/core'
import {Slice} from '@logi/src/web/core/editor/logi-hierarchy/base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-slice-part',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SlicePartComponent extends Slice {
    public constructor(
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public node!: Readonly<Column>
}
