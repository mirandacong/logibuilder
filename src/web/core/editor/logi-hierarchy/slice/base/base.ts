import {Overlay} from '@angular/cdk/overlay'
import {ChangeDetectorRef, Injector, Renderer2} from '@angular/core'
import {FormControl} from '@angular/forms'
import {MatOption} from '@angular/material/core'
import {KeyboardEventCode} from '@logi/base/ts/common/key_code'
import {FormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'
import {getOptionScrollPosition} from '@logi/src/web/base/editor'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'
import {
    NameService,
    SpanType,
} from '@logi/src/web/core/editor/logi-hierarchy/slice/name'
import {
    OptionService,
} from '@logi/src/web/core/editor/logi-hierarchy/slice/option'
import {StudioApiService} from '@logi/src/web/global/api'
import {Subject, Subscription} from 'rxjs'

export class SliceNameBase {
    public constructor(public readonly injector: Injector) {
        this.apiSvc = injector.get(StudioApiService)
        this.cd = injector.get(ChangeDetectorRef)
        this.renderer2 = injector.get(Renderer2)
        this.nameSvc = injector.get(NameService)
        this.optionSvc = injector.get(OptionService)
        this.overlay = injector.get(Overlay)
    }
    public readonly apiSvc: StudioApiService
    public renderer2: Renderer2
    public cd: ChangeDetectorRef
    public readonly nameSvc: NameService
    public readonly optionSvc: OptionService
    public readonly overlay: Overlay
    public subs = new Subscription()
    public spanType = SpanType
    public detachOverlay$ = new Subject()
    public node!: Readonly<FormulaBearer>
    public slice!: Readonly<SliceExpr>
    public options: readonly string[] = []
    public currOption = ''
    public autoCompleteControl = new FormControl()
    public trackByReturnItem = trackByFnReturnItem

    public onSearchKeydown(event: KeyboardEvent): void {
        let isUp
        if (event.code === KeyboardEventCode.ARROW_UP)
            isUp = true
        else if (event.code === KeyboardEventCode.ARROW_DOWN)
            isUp = false
        else
            return
        event.preventDefault()
        event.stopPropagation()
        let currIndex = this.options.indexOf(this.currOption)
        if (currIndex === -1)
            return
        if (isUp) {
            if (currIndex === 0)
                return
            currIndex = currIndex - 1
        } else {
            if (currIndex === this.options.length - 1)
                return
            currIndex = currIndex + 1
        }
        this.currOption = this.options[currIndex]
    }

    public scrollOption(
        option: string,
        options: readonly MatOption[],
        optionEl: HTMLDivElement,
    ): void {
        const optionRefIndex = options.findIndex(m => m.viewValue === option)

        if (optionRefIndex === -1)
            return
        const panelHeight = 128
        const optionHeight = 32
        const currentScrollPosition = optionEl.scrollTop
        const scrollTop = getOptionScrollPosition(
            optionRefIndex,
            optionHeight,
            currentScrollPosition,
            panelHeight,
        )
        this.renderer2.setProperty(optionEl, 'scrollTop', scrollTop)
        optionEl.scrollIntoView()
    }
}
