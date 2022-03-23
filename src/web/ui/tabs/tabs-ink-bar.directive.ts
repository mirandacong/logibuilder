/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
    Directive,
    ElementRef,
    HostBinding,
    Input,
    NgZone,
    Renderer2,
} from '@angular/core'

import {TabPositionMode} from './table.types'

@Directive({
    exportAs: 'logiTabsInkBar',
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '[class.logi-tabs-ink-bar-animated]': 'animated',
        '[class.logi-tabs-ink-bar-no-animated]': '!animated',
    },
    selector: '[logi-tabs-ink-bar]',
})
export class LogiTabsInkBarDirective {
    public constructor(
        private readonly _renderer: Renderer2,
        private readonly _elementRef: ElementRef,
        private readonly _ngZone: NgZone,
    ) {
    }

    @Input() public animated = false
    @Input() public positionMode: TabPositionMode = 'horizontal'
    @HostBinding('class.logi-tabs-ink-bar') public inkBar = true

    public setInkColor(color: string): void {
        this._renderer
            .setStyle(this._elementRef.nativeElement, 'background-color', color)
    }

    public alignToElement(element: HTMLElement): void {
        // tslint:disable-next-line: no-typeof-undefined
        if (typeof requestAnimationFrame !== 'undefined')
            this._ngZone.runOutsideAngular(() => {
                requestAnimationFrame(() => this.setStyles(element))
            })
        else
      this.setStyles(element)
    }

    public setStyles(element: HTMLElement): void {
    /**
     * when horizontal remove height style and add transform left
     */
        if (this.positionMode === 'horizontal') {
            this._renderer.removeStyle(this._elementRef.nativeElement, 'height')
            this._renderer.setStyle(
                this._elementRef.nativeElement,
                'transform',
                `translate3d(${this.getLeftPosition(element)}, 0px, 0px)`,
            )
            this._renderer.setStyle(
                this._elementRef.nativeElement,
                'width',
                this.getElementWidth(element),
            )
        } else {
      /**
       * when vertical remove width style and add transform top
       */
            this._renderer.removeStyle(this._elementRef.nativeElement, 'width')
            this._renderer.setStyle(
                this._elementRef.nativeElement,
                'transform',
                `translate3d(0px, ${this.getTopPosition(element)}, 0px)`,
            )
            this._renderer.setStyle(
                this._elementRef.nativeElement,
                'height',
                this.getElementHeight(element),
            )
        }
    }

    public getLeftPosition(element: HTMLElement): string {
        return element ? element.offsetLeft + 'px' : '0'
    }

    public getElementWidth(element: HTMLElement): string {
        return element ? element.offsetWidth + 'px' : '0'
    }

    public getTopPosition(element: HTMLElement): string {
        return element ? element.offsetTop + 'px' : '0'
    }

    public getElementHeight(element: HTMLElement): string {
        return element ? element.offsetHeight + 'px' : '0'
    }
}
