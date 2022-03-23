import {OverlayConfig} from '@angular/cdk/overlay'
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
import {take} from 'rxjs/operators'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-col-slice-name',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class ColSliceNameComponent extends SliceNameBase
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
    public ngOnInit(): void {
        this.subs
            .add(this.autoCompleteControl.valueChanges.subscribe(pattern => {
                this.nameSvc.setName(pattern, this.spanType.NAME)
                this.optionSvc.search(pattern)
            }))
        this.subs.add(this.optionSvc.listenOptionsChange().subscribe(os => {
            this.options = os
            this.cd.detectChanges()
        }))
        this.subs.add(this.optionSvc.listenCurrOptionChange().subscribe(o => {
            this.currOption =
            ((this.currOption === this.slice.name && this.currOption
                .trim() !== '') ? this.currOption : (o === undefined ? '' : o))
            this.cd.detectChanges()
        }))
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe()
    }

    // tslint:disable-next-line: max-func-body-length
    public openSuggest(): void {
        this.currOption = this.slice.name
        this.nameSvc.init(this.slice.name)
        this.optionSvc.init(this.node.uuid, this.slice.name, this.currOption)
        /**
         * overlay config
         */
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this._el.nativeElement)
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                },
            ])
        const scrollStrategy = this.overlay.scrollStrategies.close()
        const overlayConfig = new OverlayConfig({
            hasBackdrop: true,
            height: '185px',
            panelClass: 'logi-slice-suggest-panel',
            positionStrategy,
            scrollStrategy,
            width: '240px',
        })

        /**
         * attach overlay, should not set private field for overlayRef.
         */
        const overlayRef = this.overlay.create(overlayConfig)
        const portal = new TemplatePortal(this._suggest, this._viewContainerRef)
        overlayRef.attachments().pipe(take(1)).subscribe(() => {
            this.cd.detectChanges()
            this.scrollOption(
                this.currOption,
                this._itemsRef.toArray(),
                this._optionsRef.nativeElement,
            )
        })
        overlayRef.attach(portal)
        overlayRef.backdropClick().subscribe(() => overlayRef.detach())

        /**
         * autofocus input.
         */
        const input = overlayRef.hostElement.querySelector('input')
        if (input !== null)
            input.focus()

        /**
         * set backdrop element opacity to 0.
         */
        const backdropElementStyle = overlayRef.backdropElement?.style
        if (backdropElementStyle !== undefined)
            backdropElementStyle.opacity = '0'

        /**
         * overlay detach event.
         */
        const sub = this.detachOverlay$.pipe(take(1)).subscribe(() => {
            overlayRef.detach()
        })
        overlayRef.detachments().subscribe(() => {
            sub.unsubscribe()
        })
    }

    // tslint:disable-next-line: max-func-body-length
    public onKeydown(event: KeyboardEvent): void {
        if (event.code === KeyboardEventCode.ENTER) {
            const action = new SetSliceNameActionBuilder()
                .name(this.currOption)
                .slice(this.slice)
                .target(this.node.uuid)
                .build()
            this.apiSvc.handleAction(action)
            this.detachOverlay$.next()
            return
        }
        this.onSearchKeydown(event)
        this.scrollOption(
            this.currOption,
            this._itemsRef.toArray(),
            this._optionsRef.nativeElement,
        )
    }

    public onSelectOption(e: Event, option: string): void {
        e.preventDefault()
        e.stopPropagation()
        this.currOption = option
        const action = new SetSliceNameActionBuilder()
            .name(option)
            .slice(this.slice)
            .target(this.node.uuid)
            .build()
        this.apiSvc.handleAction(action)
        this.detachOverlay$.next()
    }
    @ViewChild('suggest') private _suggest!: TemplateRef<HTMLElement>
    @ViewChildren('item') private _itemsRef!: QueryList<MatOption>
    @ViewChild('option', {static: false})
    private _optionsRef!: ElementRef<HTMLDivElement>
}
