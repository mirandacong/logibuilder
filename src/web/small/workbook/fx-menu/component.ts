import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-fx-menu',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TopMenuComponent {
}
