import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core'

import {PALETTE, RESET_COLOR} from './utils'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-palette',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class PaletteComponent {
    @Input() public curColor!: string
    @Output() public readonly borderColor$ =
        new EventEmitter<string>()
    public palette = PALETTE
    public onClick(i: number): void {
        this.borderColor$.next(this.palette[i])
    }

    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: prefer-function-over-method ext-variable-name naming-convention
    public trackByFnReturnItem(_: number, item: unknown): unknown {
        return item
    }

    public resetColor(): void {
        this.borderColor$.next(RESET_COLOR)
    }
}
