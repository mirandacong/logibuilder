/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import {Subject} from 'rxjs'

import {LogiTabLinkDirective} from './tab-link.directive'
import {LogiTabDirective} from './tab.directive'
import {LogiTabsInkBarDirective} from './tabs-ink-bar.directive'

// tslint:disable: no-null-keyword
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    exportAs: 'logiTab',
    preserveWhitespaces: false,
    selector: 'logi-tab',
    styleUrls: ['./tab.style.scss'],
    templateUrl: './tab.template.html',
})
export class LogiTabComponent implements OnChanges, OnDestroy {
    public constructor(
        public readonly elementRef: ElementRef,
    ) {}

    public position: number | null = null
    public origin: number | null = null
    public isActive = false
    public readonly stateChanges$ = new Subject<void>()
    @HostBinding('class.logi-tabs-tabpane') public tabpane = true
    @ViewChild('body_tpl', {static: true}) public content!: TemplateRef<void>
    @ViewChild('title_tpl', {static: true}) public titleTpl!: TemplateRef<void>
    @ViewChild(
        LogiTabsInkBarDirective,
        {static: true},
    ) public tabsInkBarDirective?: LogiTabsInkBarDirective
    @ContentChild(
        LogiTabDirective,
        {static: false, read: TemplateRef},
    ) public template!: TemplateRef<void>
    @ContentChild(
        LogiTabLinkDirective,
        {static: false},
    ) public linkDirective!: LogiTabLinkDirective
    @Input() public label?: string | TemplateRef<void>
    @Input() public logiRouterIdentifier?: string
    @Input() public forceRender = false
    @Input() public logiDisabled = false
    @Input() public set logiInkBarColor(color: string) {
        if (this.tabsInkBarDirective)
            this.tabsInkBarDirective.setInkColor(color)
    }
    @Output() public readonly logiClick = new EventEmitter<void>()
    @Output() public readonly logiSelect = new EventEmitter<void>()
    @Output() public readonly logiDeselect = new EventEmitter<void>()

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.logiTitle || changes.forceRender || changes.logiDisabled)
            this.stateChanges$.next()
    }

    public ngOnDestroy(): void {
        this.stateChanges$.complete()
    }
}
