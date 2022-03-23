import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core'
import {FormControl} from '@angular/forms'
import {MatDialog} from '@angular/material/dialog'
import {KeyboardEventCode} from '@logi/base/ts/common/key_code'
import {
    ActionBuilder,
    ButtonGroupBuilder,
    DialogService,
    TextDialogBuilder,
    TextLineBuilder,
    TextSpanBuilder,
    TextSpanType,
} from '@logi/src/web/ui/dialog'
import {Observable, timer} from 'rxjs'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-readonly-input',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class ReadonlyInputComponent implements OnInit {
    @Input() public set focus(value: boolean) {
        if (value === undefined || !value)
            return
        this.onDblclick()
    }
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _dialog: MatDialog,
        private readonly _dialogSvc: DialogService,
    ) {}
    @Input() public name = ''
    @Input() public otherNames: readonly string[] = []
    @Input() public readonly = false
    @Output() public readonly change$ = new EventEmitter<string>()
    public control = new FormControl()
    public showInput = false
    public ngOnInit(): void {
        this.control.setValue(this.name)
    }

    public onDblclick(): void {
        if (this.readonly)
            return
        this.showInput = true
        this.control.setValue(this.name)
        this._cd.detectChanges()
        /**
         * Set a delay to let all text be selected.
         */
        timer().subscribe((): void => {
            this._input.nativeElement.select()
        })
    }

    public onConfirm(e: Event): void {
        if (this._isSameName() || this._invalidName()) {
            if (!this._dialog.openDialogs || !this._dialog.openDialogs.length)
                this._openDialog()
            return
        }
        this.showInput = false
        if (e instanceof KeyboardEvent &&
        (e.code === KeyboardEventCode.ENTER ||
        e.code === KeyboardEventCode.NUMPAD_ENTER))
            return
        this.change$.next(this.control.value)
    }

    @ViewChild('input_el', {static: true}) private _input!: ElementRef
    private _openDialog(): void {
        let msg = ''
        if (this._invalidName())
            msg = '名称不能为空'
        else if (this._isSameName())
            msg = `名称为“${this.control.value}”的工作表已经存在，请输入其他名称`
        const onConfirm = (): Observable<boolean> =>
            new Observable(sub => {
                this._input.nativeElement.focus()
                sub.next(true)
                sub.complete()
            })
        const buttonGroup = new ButtonGroupBuilder()
            .primary(new ActionBuilder().text('确定').run(onConfirm).build())
            .build()
        const lines = [
            new TextLineBuilder()
                .spans([new TextSpanBuilder()
                    .type(TextSpanType.BASIC)
                    .text(msg)
                    .build(),
                ])
                .build(),
        ]
        const dialogData = new TextDialogBuilder()
            .title('出现问题')
            .lines(lines)
            .buttonGroup(buttonGroup)
            .build()
        this._dialogSvc.openTextDialog(dialogData)
    }

    private _isSameName(): boolean {
        return this.otherNames.includes(this.control.value)
    }

    private _invalidName(): boolean {
        return this.control.value.trim().length === 0
    }
}
