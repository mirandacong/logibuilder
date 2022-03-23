import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core'
import {
    ClickPanelEvent,
    ClickPanelEventBuilder,
    PanelItem,
    ResolvedNode,
} from '@logi/src/lib/intellisense'
import {getOptionScrollPosition} from '@logi/src/web/base/editor'

import {PanelData} from './panel_data'
import {getItemString, renderViewParts} from './render_view_parts'

export const SUGGESTION_PANEL_DATA =
    new InjectionToken<string>('SUGGESTION_PANEL_DATA')

/**
 * The height of panel's container element.
 */
const PANEL_HEIGHT = 256
/**
 * The height of each option in panel.
 */
const OPTION_HEIGHT = 32

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-suggestion',
    styleUrls: ['../editor_base/class_map/part_style.scss', './style.scss'],
    templateUrl: './template.html',
})
// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: ng-no-get-and-set-property
export class SuggestionComponent implements OnInit {
    public get resolvedNode(): ResolvedNode | undefined {
        return this.items[this.selectedIndex]?.resolvedNode
    }

    public constructor(
        private readonly _cd: ChangeDetectorRef,

        @Inject(SUGGESTION_PANEL_DATA) private readonly _data: PanelData,
        private readonly _host: ElementRef<HTMLElement>,
        private readonly _renderer: Renderer2,
    ) {}

    @Output() public readonly selectItem$ = new EventEmitter<ClickPanelEvent>()

    public items: readonly PanelItem[] = []
    public selectedIndex = 0
    public offset = 0
    public getItemString = getItemString
    public getItemHtml = renderViewParts

    public ngOnInit(): void {
        this.updatePanelData(this._data)
    }

    public getScrollElement(): HTMLElement {
        return this._scrollElementRef.nativeElement
    }

    public updatePanelData(data: PanelData): void {
        this.items = data.items
        this.selectedIndex = data.selectedIndex
        this.offset = data.offset
        this._updateScroll()
        this._updateOffset()
        this._cd.markForCheck()
    }

    /**
     * It don't listen click event here because when mousedown on panel, it
     * trigger blur event on editor container which will close the panel.
     */
    public onItemMousedown(itemIndex: number): void {
        const event = new ClickPanelEventBuilder().id(itemIndex).build()
        this.selectItem$.next(event)
    }

    @ViewChild('scroll_container', {static: true})
    private _scrollElementRef!: ElementRef<HTMLElement>

    private _updateScroll(): void {
        const scrollTop = getOptionScrollPosition(
            this.selectedIndex,
            OPTION_HEIGHT,
            this._getScrollTop(),
            PANEL_HEIGHT,
        )
        this._setScrollTop(scrollTop)
    }

    private _updateOffset(): void {
        const left = `${this.offset}px`
        this._renderer.setStyle(this._host.nativeElement, 'left', left)
    }

    private _getScrollTop(): number {
        const scrollEl = this.getScrollElement()
        return scrollEl.scrollTop
    }

    private _setScrollTop(scrollTop: number): void {
        const scrollEl = this.getScrollElement()
        if (!scrollEl)
            return
        this._renderer.setProperty(scrollEl, 'scrollTop', scrollTop)
    }
}
