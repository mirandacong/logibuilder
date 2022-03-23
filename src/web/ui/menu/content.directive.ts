// tslint:disable: no-type-assertion
// tslint:disable: unknown-instead-of-any
// tslint:disable: codelyzer-template-property-should-be-public
import {DomPortalOutlet, TemplatePortal} from '@angular/cdk/portal'
import {DOCUMENT} from '@angular/common'
import {
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    Directive,
    Inject,
    InjectionToken,
    Injector,
    OnDestroy,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core'
import {Subject, Subscription} from 'rxjs'

export const LOGI_MENU_CONTENT_TOKEN =
    new InjectionToken<LogiMenuContentDirective>('logi-menu-content')

@Directive({
    providers: [{
        provide: LOGI_MENU_CONTENT_TOKEN,
        useExisting: LogiMenuContentDirective,
    }],
    // tslint:disable-next-line: component-selector
    selector: 'ng-template[logi-menu-content]',
})
export class LogiMenuContentDirective implements OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _templateRef: TemplateRef<any>,
        private readonly _componentFactoryResolver: ComponentFactoryResolver,
        private readonly _appRef: ApplicationRef,
        private readonly _injector: Injector,
        private readonly _viewContainerRef: ViewContainerRef,
        @Inject(DOCUMENT) private readonly _document: any,
    ) {}

    public attach(context: any = {}): void {
        if (!this._portal)
            this._portal = new TemplatePortal(
                this._templateRef, this._viewContainerRef)

        this.detach()

        if (!this._outlet)
            this._outlet = new DomPortalOutlet(this._document
                .createElement('div'),
          this._componentFactoryResolver, this._appRef, this._injector)

        const element: HTMLElement = this._templateRef.elementRef.nativeElement
        element.parentNode!.insertBefore(this._outlet.outletElement, element)

        if (this._cd)
            this._cd.markForCheck()

        this._portal.attach(this._outlet, context)
        this._attached$.next()
    }

    public detach(): void {
        if (this._portal && this._portal.isAttached)
            this._portal.detach()
    }

    public ngOnDestroy(): void {
        this._subscription.unsubscribe()
        if (this._outlet)
            this._outlet.dispose()
    }

    private _subscription: Subscription = new Subscription()
    private _portal?: TemplatePortal
    private _outlet?: DomPortalOutlet
    private _attached$ = new Subject<void>()
}
