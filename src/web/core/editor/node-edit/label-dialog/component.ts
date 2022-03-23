import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core'
import {FormControl} from '@angular/forms'
import {MatDialogRef} from '@angular/material/dialog'
import {KeyboardEventCode} from '@logi/base/ts/common/key_code'
import {isString} from '@logi/base/ts/common/type_guard'
import {
    AddLabelActionBuilder,
    getNodesLabel,
    ModifyLabelActionBuilder,
    RemoveLabelActionBuilder,
} from '@logi/src/lib/api'
import {Label, Node} from '@logi/src/lib/hierarchy/core'
import {pastePlainText} from '@logi/src/web/base/editor'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {StudioApiService} from '@logi/src/web/global/api'
import {fromEvent, Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {LabelDialogService as LabelService} from './service'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-label-dialog',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LabelDialogComponent implements OnInit, OnDestroy {
    public constructor(
        /**
         * 'public' here for trigger detectchange outside. Because if not
         * trigger outside, ngOninit will not trigger.
         * TODO (minglong): know why and should not public cd.
         */
        // tslint:disable-next-line: ter-max-len
        // tslint:disable-next-line: codelyzer-template-property-should-be-public naming-convention
        public readonly _cd: ChangeDetectorRef,
        private readonly _dialogRef: MatDialogRef<LabelDialogComponent>,
        private readonly _labelSvc: LabelService,
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _studioApiSvc: StudioApiService,
    ) {}

    public isExisted = false
    public histLabel: readonly Label[] = this._labelSvc.getUsedLabel()

    public curLabel: readonly Label[] = []
    public formControlInput = new FormControl('')

    // tslint:disable-next-line: readonly-array
    public selected: boolean[] = []
    // tslint:disable-next-line: readonly-array
    public nameFocus: boolean[] = []

    public ngOnInit(): void {
        this._initCurLabel()
        this._studioApiSvc
            .hierarchyChange()
            .pipe(takeUntil(this._destroyed$))
            .subscribe((): void => {
                this._initCurLabel()
            },
            )
        this.formControlInput.valueChanges
            .pipe(takeUntil(this._destroyed$))
            .subscribe(value => {
                if (value.trim() === '' || !isString(value))
                    return
                this.isExisted = false
                if (this._isInHist(value)) {
                    this.isExisted = true
                    return
                }
            })
    }

    public onKeydown(): void {
        this.isExisted = false
        if (this.formControlInput.value.trim() === '')
            return
        this.addLabel(this.formControlInput.value)
        this.formControlInput.setValue('')
        this._cd.detectChanges()
    }

    public ondblclick(i: number): void {
        if (!this.selected[i])
            this.selected[i] = true
        this.nameFocus[i] = true
        const inputel = this._labels.toArray()[i].nativeElement
        /**
         * You need to set a certain time delay effect,
         * otherwise the focus event and contenteditable = true
         * will be triggered at the same time,
         * causing the cursor to be unable to focus to elemnt
         */
        const timeOut = 100
        // tslint:disable-next-line: no-scheduling-timers
        setTimeout(
            (): void => {
                this._setCursorToEnd(inputel, i)
            },
            timeOut,
        )
    }

    public removeCurLabel(i: number): void {
        this.isExisted = false
        const old = this._oldLabel[i]
        const targets = this._findNode(old, true)
        if (targets.length === 0)
            return
        const action = new RemoveLabelActionBuilder()
            .label(old)
            .targets(targets.map(sub => sub.uuid))
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public removeHistLabel(label: Label): void {
        this.isExisted = false
        this._labelSvc.removeUsedLabel(label)
        this.histLabel = this._labelSvc.getUsedLabel()
        this._cd.detectChanges()
    }

    public addLabel(label: Label): void {
        this._addHistLabel(label)
        const targets = this._findNode(label, false)
        if (targets.length === 0) {
            this.isExisted = true
            this._cd.detectChanges()
            return
        }
        this.isExisted = false
        const action = new AddLabelActionBuilder()
            .label(label)
            .targets(targets.map((sub: Readonly<Node>): string => sub.uuid))
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public onInput(): void {
        if (this.formControlInput.value.trim() === '')
            return
        this.addLabel(this.formControlInput.value)
        this.formControlInput.setValue('')
    }

    public close(): void {
        this._dialogRef.close()
    }

    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: prefer-function-over-method ext-variable-name naming-convention codelyzer-template-property-should-be-public
    public trackByFnReturnItem(_: number, item: unknown): unknown {
        return item
    }

    /**
     * Here the trackByFn renturns the (unique) index instead of item, only
     * because when changing items of the array whose type is primitive in JS
     * (i.e. string), the input will lose focus.
     *
     * See:
     * https://stackoverflow.com/questions/42322968/angular2-dynamic-input-field-lose-focus-when-input-changes
     * https://groups.google.com/forum/#!topic/angular/eB19TlFHFVE
     */
    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: prefer-function-over-method ext-variable-name naming-convention codelyzer-template-property-should-be-public
    public trackByFnReturnIndex(index: number, _: unknown): number {
        return index
    }

    public ngOnDestroy(): void {
        this._destroyed$.next()
        this._destroyed$.complete()
        this._destroyLabel$.next()
        this._destroyLabel$.complete()
    }

    public nameChange(i: number): void {
        this.nameFocus[i] = false
        this.selected[i] = false
        const text = this._labels.toArray()[i].nativeElement.textContent
        if (text === null)
            return
        this._modifiedLabel(text, i)
        this.isExisted = false
    }

    public hasScrollbar(): boolean {
        if (this._container === undefined)
            return false
        const el = this._container.nativeElement
        return el?.scrollHeight > el.clientHeight + 1
    }

    private _destroyLabel$ = new Subject<void>()
    private _destroyed$ = new Subject<void>()
    private _oldLabel: readonly Label[] = []

    @ViewChildren(
        'label',
    ) private _labels!: QueryList<ElementRef<HTMLDivElement>>
    @ViewChild('setlabel') private _container!: ElementRef<HTMLDivElement>

    private _setCursorToEnd(inputel: HTMLDivElement, i: number): void {
        const textNode = inputel.firstChild
        if (textNode === null)
            return
        const pos = this.curLabel[i].length
        const range = document.createRange()
        const caret = window.getSelection()
        range.setStart(textNode, pos)
        range.setEnd(textNode, pos)
        inputel.focus()
        caret?.removeAllRanges()
        caret?.addRange(range)
    }

    private _updataName(): void {
        this._labels.forEach((
            label: ElementRef<HTMLDivElement>,
            i: number,
        ): void => {
            const native = label.nativeElement
            native.textContent = this.curLabel[i].toString()
        })
    }

    private _isInHist(label: Label): boolean {
        return this.histLabel.find((
            hist: Label,
        ): boolean => hist === label) !== undefined
    }

    private _findNode(
        label: Label,
        hasLabel: boolean,
    ): readonly Readonly<Node>[] {
        return this._nodeFocusSvc.getSelNodes().filter((
            node: Readonly<Node>,
        ): boolean =>
            hasLabel ? node.labels.includes(label) :
                !node.labels.includes(label),
        )
    }

    private _addHistLabel(label: Label): void {
        this._labelSvc.addUsedLabel(label)
        this.histLabel = this._labelSvc.getUsedLabel()
        this._cd.detectChanges()
    }

    private _updataCurLabel(): void {
        this.selected = []
        this.nameFocus = []
        this._destroyLabel$.next()
        this._oldLabel = getNodesLabel(this._nodeFocusSvc.getSelNodes())
        this.curLabel = this._oldLabel.slice()
        this.curLabel.forEach((): void => {
            this.selected.push(false)
            this.nameFocus.push(false)
        })
        this._cd.detectChanges()
    }

    private _addEventListener(): void {
        this._labels.forEach((
            label: ElementRef<HTMLDivElement>,
            index: number,
        ): void => {
            fromEvent<ClipboardEvent>(label.nativeElement, 'paste')
                .pipe(takeUntil(this._destroyLabel$))
                .subscribe(pastePlainText)
            fromEvent<KeyboardEvent>(label.nativeElement, 'keydown')
                .pipe(takeUntil(this._destroyLabel$))
                .subscribe((e: KeyboardEvent): void => {
                    this.isExisted = false
                    this._handleKeyboard(e, label, index)
                    this._cd.detectChanges()
                })
        })
    }

    private _initCurLabel(): void {
        this._updataCurLabel()
        this._updataName()
        this._addEventListener()
    }

    private _handleKeyboard(
        event: KeyboardEvent,
        label: ElementRef,
        index: number,
    ): void {
        if (event.code !== KeyboardEventCode.ENTER &&
            event.code !== KeyboardEventCode.NUMPAD_ENTER)
            return
        event.preventDefault()
        const text = label.nativeElement.textContent
        if (text === null)
            return
        this._modifiedLabel(text, index)
    }

    private _modifiedLabel(newLabel: string, i: number): void {
        const oldLabel = this._oldLabel[i]
        const target = this._oldLabel.find((
            sub: Label,
        ): boolean => newLabel === sub)
        if (newLabel === '') {
            this._initCurLabel()
            return
        }
        if (this._isInHist(newLabel) || target !== undefined) {
            this._initCurLabel()
            this.isExisted = true
            return
        }
        const targets = this._findNode(oldLabel, true)
        if (targets.length === 0)
            return

        this._addHistLabel(newLabel)
        const action = new ModifyLabelActionBuilder()
            .newLabel(newLabel)
            .oldLabel(oldLabel)
            .targets(targets.map((sub: Readonly<Node>): string => sub.uuid))
            .build()
        this._studioApiSvc.handleAction(action)
    }
// tslint:disable-next-line: max-file-line-count
}
