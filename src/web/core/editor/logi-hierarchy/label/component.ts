import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {Label} from '@logi/src/lib/hierarchy/core'
// tslint:disable-next-line: const-enum
export enum Type {
    LABEL = 'label',
    ALIAS = 'alias',
    DATA_TYPE = 'dataType',
    STANDARD = 'standard',
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-label',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LabelComponent {
    @Input() public label!: Label
    @Input() public type = Type.LABEL
    public labelType = Type
}
