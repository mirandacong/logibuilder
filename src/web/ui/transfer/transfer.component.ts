// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable:codelyzer-template-property-should-be-public
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
// tslint:disable: use-component-view-encapsulation
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    ViewChildren,
} from '@angular/core'

import {TransferConfig} from './config'
import {TransferDirection} from './direction'
import {TransferSelectChange} from './interface'
import {TransferItem} from './item'
import {TransferChange, TransferChangeBuilder} from './transfer_change'
import {LogiTransferListComponent} from './transfer_list.component'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-transfer',
    styleUrls: ['./transfer.style.scss'],
    templateUrl: './transfer.html',
})
export class LogiTransferComponent<T> implements OnInit {
    @Input() public config!: TransferConfig
    @Input() public rightItems!: readonly TransferItem<T>[]
    @Input() public leftItems!: readonly TransferItem<T>[]

    @Output() public readonly change$ = new EventEmitter<TransferChange<T>>()
    @Output() public readonly selectChange$ =
        new EventEmitter<TransferSelectChange<T>>()

    // tslint:disable-next-line: readonly-array
    public leftDataSource: TransferItem<T>[] = []

    // tslint:disable-next-line: readonly-array
    public rightDataSource: TransferItem<T>[] = []

    public direction = TransferDirection

    public leftActive = false
    public rightActive = false
    public ngOnInit(): void {
        this.leftDataSource = this.leftItems.slice()
        this.rightDataSource = this.rightItems.slice()
        this._updateOpStatus(TransferDirection.LEFT)
        this._updateOpStatus(TransferDirection.RIGHT)
    }

    public handleLeftSelect(item: TransferItem<T>): void {
        this._handleSelect(TransferDirection.LEFT, item.checked, item)
    }

    public handleRightSelect(item: TransferItem<T>): void {
        this._handleSelect(TransferDirection.RIGHT, item.checked, item)
    }

    public moveToLeft(): void {
        this.moveTo(TransferDirection.LEFT)
    }

    public moveToRight(): void {
        this.moveTo(TransferDirection.RIGHT)
    }

    public getCheckedData(
        direction: TransferDirection,
    ): readonly TransferItem<T>[] {
        return (direction === TransferDirection.LEFT ? this.leftDataSource :
            this.rightDataSource).filter(d => d.checked)
    }

    @ViewChildren(
        LogiTransferListComponent,
    ) private _lists!: QueryList<LogiTransferListComponent<T>>

    private moveTo(direction: TransferDirection): void {
        const from = direction === TransferDirection.LEFT ?
            TransferDirection.RIGHT : TransferDirection.LEFT
        this._updateOpStatus(from, 0)
        const toSource = direction === TransferDirection.LEFT ?
            this.leftDataSource : this.rightDataSource
        const fromSource = direction === TransferDirection.LEFT ?
            this.rightDataSource : this.leftDataSource
        const moveList = fromSource.filter(item =>
            item.checked && !item.disabled)
        moveList.forEach(item => {
            item.updateChecked(false)
            item.updateDirection(direction)
            fromSource.splice(fromSource.indexOf(item), 1)
        })
        toSource.splice(0, 0, ...moveList)
        this._updateOpStatus(from)
        this.change$.next(new TransferChangeBuilder<T>()
            .from(from)
            .to(direction)
            .list(moveList)
            .left(this.leftDataSource)
            .right(this.rightDataSource)
            .build())
        this._markForCheckAllList()
    }

    private _handleSelect(
        direction: TransferDirection,
        checked: boolean,
        item: TransferItem<T>,
    ): void {
        this._updateOpStatus(direction)
        const list = this.getCheckedData(direction)
        this.selectChange$.next({
            checked,
            direction,
            item,
            list,
        })
    }

    private _markForCheckAllList(): void {
        if (this._lists === undefined)
            return
        this._lists.forEach(list => list.markForCheck())
    }

    private _updateOpStatus(
        direction: TransferDirection,
        count?: number,
    ): void {
        const status = (count === undefined ?
            this.getCheckedData(direction).length : count) > 0
        direction === TransferDirection.LEFT ? (this.leftActive = status) :
            (this.rightActive = status)
    }
}
