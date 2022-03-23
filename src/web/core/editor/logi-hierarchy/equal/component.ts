import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-equal',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class EqualComponent {}
