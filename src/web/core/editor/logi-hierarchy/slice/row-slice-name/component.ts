import {OverlayConfig, OverlayRef} from '@angular/cdk/overlay'
import {TemplatePortal} from '@angular/cdk/portal'
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef,
} from '@angular/core'
import {MatOption} from '@angular/material/core'
import {KeyboardEventCode} from '@logi/base/ts/common/key_code'
import {SetSliceNameActionBuilder} from '@logi/src/lib/api'
import {FormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'
import {
    SliceNameBase,
} from '@logi/src/web/core/editor/logi-hierarchy/slice/base'
import {Span} from '@logi/src/web/core/editor/logi-hierarchy/slice/name'
import {timer} from 'rxjs'
import {take} from 'rxjs/operators'

const enum Bool {
    AND= '与',
    OR= '或',
    NOT= '非',
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-row-slice-name',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class RowSliceNameComponent extends SliceNameBase
    implements OnInit, OnDestroy {
    public constructor(
        private readonly _el: ElementRef<HTMLElement>,
        private readonly _viewContainerRef: ViewContainerRef,
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public node!: Readonly<FormulaBearer>
    @Input() public slice!: Readonly<SliceExpr>
    public bolList: readonly Bool[] = [Bool.AND, Bool.OR, Bool.NOT]
    public canBoolean = false
    public spansList: readonly Span[] = []
    public keyboardOption = ''
    public ngOnInit(): void {
        this.subs.add(this.optionSvc.listenOptionsChange().subscribe(os => {
            this.options = os
            this.cd.markForCheck()
        }))
        this.subs.add(this.optionSvc.listenCurrOptionChange().subscribe(o => {
            this.currOption =
            ((this.currOption === this.slice.name && this.currOption
                .trim() !== '') ? this.currOption : (o === undefined ? '' : o))
            this.cd.markForCheck()
        }))
        this.subs
            .add(this.autoCompleteControl.valueChanges.subscribe(pattern => {
                this.optionSvc.search(pattern)
            }))
        this.subs.add(this.nameSvc.listenSpansChange$().subscribe(spans => {
            this.spansList = spans
            if (spans.length > 1)
                this.canBoolean = true
            this.cd.markForCheck()
        }))
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe()
    }

    public addBoolean(): void {
        if (this.options.length < 1)
            return
        this.canBoolean = true
        this.nameSvc.reset(this.currOption)
        this.cd.markForCheck()
        this._cursorIndex = 2
        this.subs.add(this._spanList.changes.subscribe(() => {
            this._scrollSpan()
            this._setCursor()
        }))
    }

    public openSuggest(): void {
        this.currOption = this.slice.name
        this.nameSvc.init(this.slice.name)
        this.optionSvc.init(this.node.uuid, this.slice.name, this.currOption)
        this._cursorIndex = 1
        const config = new OverlayConfig({
            backdropClass: 'cdk-overlay-transparent-backdrop',
            hasBackdrop: true,
            height: '360px',
            positionStrategy: this.overlay
                .position()
                .flexibleConnectedTo(this._el.nativeElement)
                .withPositions([{
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                }]),
            scrollStrategy: this.overlay.scrollStrategies.close(),
            width: '240px',
        })
        this._overlayRef = this.overlay.create(config)
        const portal = new TemplatePortal(this._suggest, this._viewContainerRef)
        this._overlayRef.attachments().pipe(take(1)).subscribe(() => {
            this.cd.detectChanges()
            this.scrollOption(
                this.currOption,
                this._itemsRef.toArray(),
                this._optionsRef.nativeElement,
            )
        })
        this._overlayRef.attach(portal)
        this._overlayRef.backdropClick().subscribe(() => {
            this.closeSuggest()
        })
    }

    public clearnSpans(): void {
        this.nameSvc.clean()
        this._cursorIndex = 1
    }

    public closeSuggest(): void {
        const action = new SetSliceNameActionBuilder()
            .slice(this.slice)
            .target(this.node.uuid)
            .name(this.canBoolean ?
                this.nameSvc.getNameList() : this.currOption)
            .build()
        this.apiSvc.handleAction(action)
        this.detachOverlay$.next()
        this._overlayRef?.detach()
    }

    public selectOffset(event: Event, i: number): void {
        event.preventDefault()
        event.stopPropagation()
        this._cursorIndex = i + 2
        this._setCursor()
    }

    public onSpansKeydown(event: KeyboardEvent): void {
        event.preventDefault()
        if (this._cursorIndex <= 0)
            this._cursorIndex = this._spanList.length + 1

        if (event.code === KeyboardEventCode.ARROW_UP ||
            event.code === KeyboardEventCode.ARROW_LEFT ||
            event.code === KeyboardEventCode.ARROW_DOWN ||
            event.code === KeyboardEventCode.ARROW_RIGHT) {
            this._getSpanIndex(event.code === KeyboardEventCode.ARROW_UP ||
                event.code === KeyboardEventCode.ARROW_LEFT)
            this._scrollSpan()
            this._setCursor()
        }

        if (event.code === KeyboardEventCode.BACKSPACE)
            this._removeNode()
        const el = document.getElementsByClassName('spans-input')[0]
        /**
         * Chinese input method
         */
        this.cd.markForCheck()
        timer().subscribe(() => {
            el.childNodes.forEach(e => {
                if (e.nodeType === Node.TEXT_NODE)
                    e.remove()
            })
        })
        return
    }

    public onKeydown(event: KeyboardEvent): void {
        if (event.code === KeyboardEventCode.ENTER) {
            this.onSelectOption(event, this.keyboardOption)
            return
        }
        if (!this.canBoolean) {
            this.onSearchKeydown(event)
            this.scrollOption(
                this.currOption,
                this._itemsRef.toArray(),
                this._optionsRef.nativeElement,
            )
            return
        }
        let currIndex = this.options.indexOf(this.keyboardOption)
        if (currIndex === -1) {
            this.keyboardOption = this.options[0]
            currIndex = event.code === KeyboardEventCode.ARROW_UP ? 0 : -1
        }
        if (event.code === KeyboardEventCode.ARROW_UP)
            this.keyboardOption = this.options[currIndex === 0 ?
                currIndex : currIndex - 1]
        if (event.code === KeyboardEventCode.ARROW_DOWN)
            this.keyboardOption = this.options[currIndex ===
            this.options.length - 1 ? currIndex : currIndex + 1]
        this.scrollOption(
            this.keyboardOption,
            this._itemsRef.toArray(),
            this._optionsRef.nativeElement,
        )
    }

    public onSelectOption(e: Event, option: string): void {
        e.preventDefault()
        e.stopPropagation()
        if (this.canBoolean) {
            this.nameSvc.setName(
                option,
                this.spanType.NAME,
                this._cursorIndex - 1,
            )
            this._cursorIndex += 1
            return
        }
        this.currOption = option
        this.cd.markForCheck()
    }

    public addName(b: Bool): void {
        this.nameSvc.setName(b, this.spanType.OPERATOR, this._cursorIndex - 1)
        this._cursorIndex += 1
    }

    /**
     * for test
     */
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public getCursor(): number {
        return this._cursorIndex
    }

    public isChoosed(option: string): boolean {
        let choosed = false
        this.node.sliceExprs.forEach(s => {
            if (s.name === option && s.name !== this.slice.name)
                choosed = true
        })
        if (this.currOption === option)
            choosed = true
        return choosed
    }
    private _overlayRef?: OverlayRef
    private _cursorIndex = 1
    @ViewChild('suggest') private _suggest!: TemplateRef<HTMLElement>
    @ViewChildren('span') private _spanList!: QueryList<ElementRef>
    @ViewChildren('item') private _itemsRef!: QueryList<MatOption>
    @ViewChild('option', {static: false})
    private _optionsRef!: ElementRef<HTMLDivElement>

    private _removeNode(): void {
        this.nameSvc.remove(this.spansList[this._cursorIndex - 2])
        this._getSpanIndex(true)
    }

    /**
     * cursor opsition,
     * 0            1      2      3
     * | trans span | span | span | ...
     * Have a transparent span seize a set ,because when spanlist is empty
     * the cursor disappears.
     * So the first spanIndex is 1.
     */
    private _getSpanIndex(isLeft?: boolean): void {
        if (isLeft !== undefined)
            this._cursorIndex = isLeft ?
                this._cursorIndex - 1 : this._cursorIndex + 1
        if (this._cursorIndex <= 0)
            this._cursorIndex = 1
        if (this._cursorIndex > this._spanList.length + 1)
            this._cursorIndex = this._spanList.length + 1
    }

    private _setCursor(): void {
        const el = document.getElementsByClassName('spans-input')[0]
        const range = document.createRange()
        const sel = window.getSelection()
        range.setStart(el, this._cursorIndex)

        range.collapse(true)
        sel?.removeAllRanges()
        sel?.addRange(range)

        this.cd.markForCheck()
    }

    private _scrollSpan(): void {
        if (this._cursorIndex - 1 > this._spanList.length ||
            this._spanList.length === 0)
            return
        const element = this._spanList.toArray()[this._cursorIndex - 2]
        const span = element.nativeElement
        span.scrollIntoView()
    }
}
