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
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-option-group',
    },
    selector: 'logi-option-group',
    styleUrls: ['./option_group.style.scss'],
    templateUrl: './option_group.template.html',
})
export class LogiOptionGroupComponent {
    @Input() public label = ''

    public hasLabel(): boolean {
        return this.label.length !== 0
    }
}
