import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    ViewEncapsulation,
} from '@angular/core'
import {Subject} from 'rxjs'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    selector: 'logi-combobox-option-group',
    template: '<ng-content></ng-content>',
})
export class LogiComboboxOptionGroupComponent implements OnChanges {
    @Input() public label: string | null = null
    changes$ = new Subject<void>()

    ngOnChanges(): void {
        this.changes$.next()
    }
}
