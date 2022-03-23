import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {NavGroup} from '@logi/src/web/core/logi-docsite/nav/group'
import {isNavItem} from '@logi/src/web/core/logi-docsite/nav/item'
import {routerParse} from '@logi/src/web/core/logi-docsite/tools/gen_router'
import {
    Service as LocationService,
} from '@logi/src/web/core/logi-docsite/views/services/location/service'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-side-menu',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class MenuComponent implements OnInit {
    public constructor(private readonly _locationSvc: LocationService) {}

    @Input() public menuGroup!: NavGroup
    public isNavItem = isNavItem

    public ngOnInit(): void {
        this._locationSvc.setRouterList(routerParse(this.menuGroup))
    }
}
