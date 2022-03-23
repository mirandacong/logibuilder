import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    ViewEncapsulation,
} from '@angular/core'

import {CascadedSelectOption} from './option'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-cascaded-select-option',
    },
    // tslint:disable-next-line: component-selector
    selector: '[logi-cascaded-select-option]',
    styleUrls: ['./option.style.scss'],
    templateUrl: './option.template.html',
})
export class LogiCascadedSelectOptionComponent {
    public constructor(
        private readonly _el: ElementRef<HTMLElement>,
        private readonly _cd: ChangeDetectorRef,
    ) {
        this.hostElemnet = this._el.nativeElement
    }

    @Input() public option!: CascadedSelectOption
    @Input() public columnIndex!: number
    @Input() public activated = false

    public hostElemnet: HTMLElement

    public markForCheck(): void {
        this._cd.markForCheck()
    }
}
