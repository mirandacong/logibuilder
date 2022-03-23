/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
    Directive,
    EmbeddedViewRef,
    Input,
    OnChanges,
    SimpleChange,
    SimpleChanges,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core'

@Directive({
    selector: '[logiStringTemplateOutlet]',
    exportAs: 'logiStringTemplateOutlet',
})
export class LogiStringTemplateOutletDirective<_T = unknown> implements OnChanges {
    public constructor(private viewContainer: ViewContainerRef, private templateRef: TemplateRef<unknown>) {}

    public static ngTemplateContextGuard<T>(
        _dir: LogiStringTemplateOutletDirective<T>,
        _ctx: unknown,
    ): _ctx is LogiStringTemplateOutletContext {
        return true
    }
    // tslint:disable-next-line: unknown-instead-of-any
    @Input() public logiStringTemplateOutletContext: any | null = null
    @Input() public logiStringTemplateOutlet: unknown | TemplateRef<unknown> = null

    public ngOnChanges(changes: SimpleChanges): void {
        const {logiStringTemplateOutletContext, logiStringTemplateOutlet} = changes
        const shouldRecreateView = (): boolean => {
            let shouldOutletRecreate = false
            if (logiStringTemplateOutlet)
                if (logiStringTemplateOutlet.firstChange)
                    shouldOutletRecreate = true
                else {
                    const isPreviousOutletTemplate = logiStringTemplateOutlet.previousValue instanceof TemplateRef
                    const isCurrentOutletTemplate = logiStringTemplateOutlet.currentValue instanceof TemplateRef
                    shouldOutletRecreate = isPreviousOutletTemplate || isCurrentOutletTemplate
                }
            const hasContextShapeChanged = (
                ctxChange: SimpleChange,
            ): boolean => {
                const prevCtxKeys = Object.keys(ctxChange.previousValue || {})
                const currCtxKeys = Object.keys(ctxChange.currentValue || {})
                if (prevCtxKeys.length === currCtxKeys.length) {
                    for (const propName of currCtxKeys)
            if (prevCtxKeys.indexOf(propName) === -1)
                return true
                    return false
                }
                return true
            }
            const shouldContextRecreate = logiStringTemplateOutletContext && hasContextShapeChanged(
                logiStringTemplateOutletContext,
            )
            return shouldContextRecreate || shouldOutletRecreate
        }

        if (logiStringTemplateOutlet)
            this.context.$implicit = logiStringTemplateOutlet.currentValue

        const recreateView = shouldRecreateView()
        if (recreateView)
      /** recreate view when context shape or outlet change **/
            this.recreateView()
        else
      /** update context **/
      this.updateContext()
    }
    private embeddedViewRef: EmbeddedViewRef<unknown> | null = null
    private context = new LogiStringTemplateOutletContext()

    private recreateView(): void {
        this.viewContainer.clear()
        const isTemplateRef = this.logiStringTemplateOutlet instanceof TemplateRef
        // tslint:disable-next-line: unknown-instead-of-any
        const templateRef = (isTemplateRef ? this.logiStringTemplateOutlet : this.templateRef) as any
        this.embeddedViewRef = this.viewContainer.createEmbeddedView(
            templateRef,
            isTemplateRef ? this.logiStringTemplateOutletContext : this.context,
        )
    }

    private updateContext(): void {
        const isTemplateRef = this.logiStringTemplateOutlet instanceof TemplateRef
        const newCtx = isTemplateRef ? this.logiStringTemplateOutletContext : this.context
        // tslint:disable-next-line: unknown-instead-of-any
        const oldCtx = this.embeddedViewRef!.context as any
        if (newCtx)
            for (const propName of Object.keys(newCtx))
        oldCtx[propName] = newCtx[propName]
    }
}

export class LogiStringTemplateOutletContext {
    // tslint:disable-next-line: unknown-instead-of-any
    public $implicit: any
}
