import {Overlay, OverlayConfig} from '@angular/cdk/overlay'
import {CdkPortal} from '@angular/cdk/portal'
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core'
import {
    ErrorInfo,
    ErrorResult,
    ErrorResultBuilder,
    ErrorType,
} from '@logi/src/lib/api'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'
import {
    NodeFocusService,
    SelConfigBuilder,
} from '@logi/src/web/core/editor/node-focus'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {Subscription} from 'rxjs'

import {ErrorInfoService} from './service'
import {Tab, TabBuilder} from './tab'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-error-info',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class ErrorInfoComponent implements OnInit, AfterViewInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _el: ElementRef,
        private readonly _errorInfoSvc: ErrorInfoService,
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _overlay: Overlay,
        private readonly _studioApiSvc: StudioApiService,
    ) {
        this.tabs = getTabs(new ErrorResultBuilder().actionType(1).build())
    }
    public trackBy = trackByFnReturnItem
    public errorCount = 0
    public tabs: readonly Tab[] = []
    public currError?: ErrorInfo
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    @HostBinding('class.is-show-info') public isShowInfo = false
    public ngOnInit(): void {
        this._subs.add(this._studioApiSvc.errorInfoChange().subscribe(err => {
            this.errorCount = err.errors.length
            this.tabs = getTabs(err)
            this._cd.detectChanges()
        }))
    }

    @HostListener('click')
    public onTriggerErrorInfo(): void {
        if (this._errorInfoPortal.isAttached) {
            this._errorInfoPortal.detach()
            return
        }
        if (this.errorCount === 0)
            return
        const config = this._getOverlayConfig()
        const overlayRef = this._overlay.create(config)
        this._errorInfoPortal.attach(overlayRef)
        this.isShowInfo = true
        this._subs.add(overlayRef.detachments().subscribe(() => {
            this.isShowInfo = false
            this._cd.markForCheck()
        }))
    }

    public ngAfterViewInit(): void {
        this._errorInfoSvc.registry(this._errorInfoPortal)
    }

    public onClickError(error: ErrorInfo): void {
        this.currError = error
        const config = new SelConfigBuilder()
            .scrollIntoView(true)
            .isExpand(true)
            .multiSelect(false)
            .trust(true)
            .build()
        this._nodeFocusSvc.setSelNodes([error.node], undefined, config)
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }
    private readonly _subs = new Subscription()
    @ViewChild(CdkPortal) private readonly _errorInfoPortal!: CdkPortal
    private _getOverlayConfig(): OverlayConfig {
        const config = new OverlayConfig()
        config.height = '480px'
        // tslint:disable-next-line: no-magic-numbers
        config.width = '720px'
        config.panelClass = 'logi-error-info-panel-class'
        config.positionStrategy = this._overlay
            .position()
            .flexibleConnectedTo(this._el.nativeElement)
            .withPositions([
                {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'bottom',
                    offsetX: -20,
                    offsetY: -40,
                },
            ])
            .withFlexibleDimensions(true)
        config.scrollStrategy = this._overlay.scrollStrategies.block()
        return config
    }
}

function getTabs(errResult: ErrorResult): readonly Tab[] {
    const undefinedErrs = errResult.errors
        .filter(e => e.errorType === ErrorType.UNDEFINED)
    const functionErrs = errResult.errors
        .filter(e => e.errorType === ErrorType.FUNCTION)
    const grammarErrs = errResult.errors
        .filter(e => e.errorType === ErrorType.GRAMMAR)
    const duplinameErrs = errResult.errors
        .filter(e => e.errorType === ErrorType.DULPLICATE_NAME)
    return [
        new TabBuilder()
            .name('未定义引用')
            .count(undefinedErrs.length)
            .errors(undefinedErrs)
            .build(),
        new TabBuilder()
            .name('函数错误')
            .count(functionErrs.length)
            .errors(functionErrs)
            .build(),
        new TabBuilder()
            .name('语法错误')
            .count(grammarErrs.length)
            .errors(grammarErrs)
            .build(),
        new TabBuilder()
            .name('重名')
            .count(duplinameErrs.length)
            .errors(duplinameErrs)
            .build(),
    ]
}
