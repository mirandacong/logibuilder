import {ChangeDetectionStrategy, Component, Input} from '@angular/core'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-custom-sheet',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class CustomSheetComponent {
    @Input() public sheetname = ''
}
