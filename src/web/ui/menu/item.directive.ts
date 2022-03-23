import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    Directive,
    ElementRef,
    HostListener,
    Inject ,
    Input,
    OnDestroy,
    Optional,
} from '@angular/core'
import {Subject} from 'rxjs'

import {LogiMenuComponent, LOGI_MENU_PANEL} from './component'

// tslint:disable: unknown-instead-of-any
@Directive({
    // tslint:disable: no-host-metadata-property object-literal-sort-keys
    host: {
        class: 'logi-menu-item',
        '[class.logi-menu-item-submenu-trigger]': 'triggersSubmenu',
        '[attr.disabled]': 'disabled || null',
    },
    selector: '[logi-menu-item]',
})
export class LogiMenuItemDirective implements OnDestroy {
    public constructor(
        public readonly elementRef: ElementRef,
        // tslint:disable-next-line: parameter-properties
        @Inject(LOGI_MENU_PANEL) @Optional()
        public parentMenu?: LogiMenuComponent,
    ) {}

    @Input() public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value)
    }

    public get disabled(): boolean {
        return this._disabled
    }

    // tslint:disable-next-line: ext-variable-name variable-name
    public static ngAcceptInputType_disabled: BooleanInput
    public hovered$ = new Subject<LogiMenuItemDirective>()
    public triggersSubmenu = false
    public highlighted = false
    public isActive = false

    public ngOnDestroy(): void {
        this.hovered$.complete()
    }

    @HostListener('mouseenter')
    public onMouseenter(): void {
        this.hovered$.next(this)
    }

    @HostListener('click', ['$event'])
    public checkDisabled(event: Event): void {
        if (this._disabled) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    private _disabled = false
}
