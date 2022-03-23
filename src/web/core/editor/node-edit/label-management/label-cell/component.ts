import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core'
import {KeyboardEventCode} from '@logi/base/ts/common/key_code'
import {Label} from '@logi/src/lib/hierarchy/core'
import {pastePlainText} from '@logi/src/web/base/editor'
import {fromEvent, Subject, timer} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-label-cell',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LabelCellComponent implements OnInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
    ) {}
    @Input() public label!: Label
    @Output() public readonly cellChange$ = new EventEmitter<CellChange>()
    @Input() public selected!: boolean

    // tslint:disable-next-line: readonly-array
    public nameFocus = false
    public nameBlur(): void {
        this.nameFocus = false
        this._initLabel()
        this._addEventListener()
        this._cd.detectChanges()
    }

    public onDblclick(): void {
        this.nameFocus = true
        const inputel = this._el.nativeElement
        /**
         * You need to set a certain time delay effect,
         * otherwise the focus event and contenteditable = true
         * will be triggered at the same time,
         * causing the cursor to be unable to focus to elemnt
         */
        const timeOut = 10
        timer(timeOut).subscribe((): void => {
            setCursorToEnd(inputel, this.label)
        })
    }

    public ngOnInit(): void {
        this._cd.detectChanges()
        this._initLabel()
        this._addEventListener()
    }

    public ngOnDestroy(): void {
        this._destroyed$.next()
        this._destroyed$.complete()
    }

    public removeLabel(): void {
        this.cellChange$.next(new CellChange(true, '', this.label))
    }
    private _destroyed$ = new Subject<void>()
    @ViewChild('labeltext') private _el!: ElementRef<HTMLDivElement>

    private _initLabel(): void {
        const native = this._el.nativeElement
        native.textContent = this.label.toString()
    }

    private _addEventListener(): void {
        fromEvent<ClipboardEvent>(this._el.nativeElement, 'paste')
            .pipe(takeUntil(this._destroyed$))
            .subscribe(pastePlainText)
        fromEvent<KeyboardEvent>(this._el.nativeElement, 'keydown')
            .pipe(takeUntil(this._destroyed$))
            .subscribe((e: KeyboardEvent): void => {
                if (e.code !== KeyboardEventCode.ENTER &&
                    e.code !== KeyboardEventCode.NUMPAD_ENTER)
                    return
                e.preventDefault()
                this._modified()
                this.nameFocus = false
                this._cd.detectChanges()
            })
    }

    private _modified(): void {
        const newLabel = this._el.nativeElement.textContent
        if (newLabel === null || newLabel === '' || newLabel === this.label) {
            const native = this._el.nativeElement
            native.textContent = this.label.toString()
            return
        }
        this.cellChange$.next(new CellChange(false, newLabel, this.label))
    }
}

function setCursorToEnd(inputel: HTMLDivElement, label: Label): void {
    const textNode = inputel.firstChild
    if (textNode === null)
        return
    const pos = label.length
    const range = document.createRange()
    const caret = window.getSelection()
    range.setStart(textNode, pos)
    range.setEnd(textNode, pos)
    inputel.focus()
    caret?.removeAllRanges()
    caret?.addRange(range)
}
export class CellChange {
    public constructor(
        public readonly isRemove: boolean = false,
        public readonly newLabel: Label = '',
        public readonly oldLabel: Label) {}
}
