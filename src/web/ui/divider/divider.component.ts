import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-divider',
    styleUrls: ['./divider.component.scss'],
    templateUrl: './divider.component.html',
})
export class DividerComponent {}
