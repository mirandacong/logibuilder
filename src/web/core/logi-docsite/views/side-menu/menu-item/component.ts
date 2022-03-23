import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core'
import {
    Service as LocationService,
} from '@logi/src/web/core/logi-docsite/views/services/location/service'
import {NavGroup} from '@logi/src/web/core/logi-docsite/nav/group'
import {isNavItem, NavItem} from '@logi/src/web/core/logi-docsite/nav/item'
import {Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-menu-item',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class MenuItemComponent implements OnInit, OnDestroy {
    public constructor(private readonly _locationSvc: LocationService) {
    }

    @Input() public node!: NavGroup
    @Output() public readonly selectedEvent = new EventEmitter()

    /**
     * Index of the selected item, -1 means no item was selected.
     */
    public selectedId = -1
    public hideGroup = true
    public isNavItem = isNavItem

    public ngOnInit(): void {
        this._locationSvc
            .currentPath$()
            .pipe(takeUntil(this._onDestory$))
            .subscribe((path: string): void => this._setSelected(path))
    }

    public ngOnDestroy(): void {
        this._onDestory$.next()
    }

    public onSelected(): void {
        this.hideGroup = false

        /**
         * Change the `selectedId` to a value that is not equal to -1 or any
         * child index if child menu-item was selected, here use `-2`.
         */
        // tslint:disable-next-line: no-magic-numbers
        this.selectedId = (this.selectedId === -1) ? -2 : this.selectedId
        this.selectedEvent.emit()
    }

    public toggle(): void {
        this.hideGroup = !this.hideGroup
    }

    private _onDestory$ = new Subject()

    private _setSelected(path: string): void {
        let selected = -1
        this.node.group.forEach(
            (node: Readonly<NavGroup> | Readonly<NavItem>): void => {
                if (isNavItem(node) && node.url === path)
                    selected = this.node.group.indexOf(node)
            })
        if (selected !== -1)
            this.onSelected()
        this.selectedId = selected
    }
}
