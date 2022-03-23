/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
    Directive,
    ElementRef,
    HostBinding,
    Input,
    Renderer2,
} from '@angular/core'

@Directive({
    exportAs: 'logiTabLabel',
    selector: '[logi-tab-label]',
})
export class LogiTabLabelDirective {
    public constructor(
        public readonly elementRef: ElementRef,
        public readonly renderer: Renderer2,
    ) {
        renderer.addClass(elementRef.nativeElement, 'logi-tabs-tab')
    }

    @HostBinding('class.logi-tabs-tab-disabled') @Input() public disabled = false

    public getOffsetLeft(): number {
        return this.elementRef.nativeElement.offsetLeft
    }

    public getOffsetWidth(): number {
        return this.elementRef.nativeElement.offsetWidth
    }

    public getOffsetTop(): number {
        return this.elementRef.nativeElement.offsetTop
    }

    public getOffsetHeight(): number {
        return this.elementRef.nativeElement.offsetHeight
    }
}
