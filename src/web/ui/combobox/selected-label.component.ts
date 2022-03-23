import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core'
import {SafeAny} from '@logi/src/web/ui/core'

import {OptionPayload} from './interface'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.deletable]': 'deletable',
        '[class.logi-selected-label-disabled]': 'disabled',
        '[class.logi-selected-label-exceed]': 'isExceedTag',
        class: 'logi-selected-label',
    },
    selector: 'logi-selected-label',
    styleUrls: ['./selected-label.style.scss'],
    templateUrl: './selected-label.template.html',
})
export class LogiSelectedLabelComponent {
    @Input() public label: string | null | undefined = null
    @Input() public deletable = false
    @Input() public disabled = false
    @Input() public isExceedTag: boolean | undefined = false
    @Input() public labelContentTpl: TemplateRef<SafeAny> | null = null
    @Input() public labelContentTplContext: SafeAny | null = null
    @Output() public readonly delete$ = new EventEmitter<OptionPayload>()

    public onDelete(event: Event): void {
        if (this.disabled)
            return
        this.delete$.emit()
        event.stopPropagation()
    }
}
