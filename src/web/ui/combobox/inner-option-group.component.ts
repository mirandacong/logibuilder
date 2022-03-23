import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewEncapsulation,
} from '@angular/core'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'logi-inner-option-group',
    },
    selector: 'logi-inner-option-group',
    styleUrls: ['./inner-option-group.component.scss'],
    templateUrl: './inner-option-group.component.html',
})
export class LogiInnerOptionGroupComponent {
    @Input() public label = ''
}
