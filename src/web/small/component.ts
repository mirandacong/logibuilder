import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-small',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SmallComponent {
}
