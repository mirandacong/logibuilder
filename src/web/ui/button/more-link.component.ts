import {Component, Input, ChangeDetectionStrategy} from '@angular/core'

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'a[logi-more-link]',
    templateUrl: './more-link.component.html',
    styleUrls: ['./more-link.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogiMoreLinkComponent {
    @Input() text = '更多'
    @Input() icon = 'ic_arrow_right'
}
