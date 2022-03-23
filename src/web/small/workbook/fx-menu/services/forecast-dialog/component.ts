import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    ViewChild,
} from '@angular/core'
import {FormControl} from '@angular/forms'
import {MatDialog, MatDialogRef} from '@angular/material/dialog'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'

import {EditDialogComponent} from './edit-dialog/component'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-forecast-dialog',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class ForecastDialogComponent {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _dialog: MatDialog,
        private readonly _dialogRef: MatDialogRef<ForecastDialogComponent>,
        private readonly _nodeEditSvc: NodeEditService,
    ) {}

    // tslint:disable-next-line: readonly-array
    public splitList: FormControl[] = [new FormControl(), new FormControl()]

    public isScroll = false

    @ViewChild('input_block', {static: true})
    public inputBlock!: ElementRef<HTMLDivElement>
    public addItem(): void {
        this.splitList.push(new FormControl())
        this._cd.detectChanges()
        // tslint:disable-next-line: ng-rvalue-only-native-element
        this.inputBlock.nativeElement.scrollTop
            = this.inputBlock.nativeElement.scrollHeight
        this.isScroll = this.inputBlock.nativeElement.scrollTop !== 0
        this._cd.detectChanges()
    }

    public openEditItems(): void {
        let data = ''
        this.splitList.forEach(s => {
            if (s.value === null || s.value.trim() === '')
                return
            // tslint:disable-next-line: prefer-template
            data = data + s.value + '\n'
        })

        this._dialog
            .open(EditDialogComponent, {
                autoFocus: false,
                data})
            .afterClosed()
            .subscribe((itemNameList: string[] | undefined): void => {
                if (!itemNameList)
                    return
                this.splitList = []
                itemNameList.forEach(iname => {
                    this.splitList.push(new FormControl(iname))
                })
                this._cd.detectChanges()
            })
    }

    public setForecast(): void {
        const itemNameList: string [] = []
        this.splitList.forEach(s => {
            if (s.value === null || s.value.trim() === '')
                return
            itemNameList.push(s.value)
        })
        if (itemNameList.length !== 0)
            this._nodeEditSvc.itemizedForecast(itemNameList)
        this._dialogRef.close()
    }

    public onCancel(): void {
        this._dialogRef.close()
    }

    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: prefer-function-over-method ext-variable-name naming-convention
    public trackByFnReturnItem(_: number, item: unknown): unknown {
        return item
    }
}
