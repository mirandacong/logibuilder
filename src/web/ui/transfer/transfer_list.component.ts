// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable:codelyzer-template-property-should-be-public
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
// tslint:disable: use-component-view-encapsulation
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core'

import {TransferDirection} from './direction'
import {TransferItem} from './item'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-transfer-list',
    styleUrls: ['./transfer_list.style.scss'],
    templateUrl: './transfer_list.html',
})
export class LogiTransferListComponent<T> {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
    ) {}
    @Input() public direction: TransferDirection = TransferDirection.LEFT
    @Input() public dataSource!: readonly TransferItem<T>[]
    @Output() public readonly select$ = new EventEmitter<TransferItem<T>>()

    public handleChange(item: TransferItem<T>): void {
        if (item.disabled)
            return
        item.updateChecked(!item.checked)
        this.select$.next(item)
    }

    public markForCheck(): void {
        this._cd.markForCheck()
    }
}
