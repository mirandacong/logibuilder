import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core'

import {LogiOptionComponent} from './option.component'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '[class.deletable]': 'deletable',
        '[class.logi-selected-label-disabled]': 'disabled',
        class: 'logi-selected-label',
    },
    selector: 'logi-selected-label',
    styleUrls: ['./selected_label.style.scss'],
    templateUrl: './selected_label.template.html',
})
export class LogiSelectedLabelComponent {
    @Input() public option!: LogiOptionComponent
    @Input() public deletable = false
    @Input() public disabled = false
    // tslint:disable: no-null-keyword unknown-instead-of-any
    @Input() public labelContentTpl: TemplateRef<any> | null = null
    @Input() public labelContentTplContext: any | null = null

    @Output()
    public readonly deleteOption$ = new EventEmitter<LogiOptionComponent>()

    public get content(): string {
        if (this.option.label.trim().length !== 0)
            return this.option.label
        return String(this.option.value ?? '')
    }

    public onDelete(event: Event): void {
        if (this.disabled)
            return
        this.deleteOption$.emit(this.option)
        event.stopPropagation()
    }
}
