import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core'
import {NavGroup} from '@logi/src/web/core/logi-docsite/nav/group'
import {
    Service as LocationService,
} from '@logi/src/web/core/logi-docsite/views/services/location/service'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-basic-docsite',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class DocSiteComponent implements OnInit, OnDestroy {
    public constructor(private readonly _locationSvc: LocationService) {
    }
    @Input() public menuGroup!: NavGroup
    @Input() public staticPrefix = ''
    public ngOnInit(): void {
        this._locationSvc.setStaticPrefix(this.staticPrefix)
    }

    public ngOnDestroy(): void {
        this._locationSvc.clearUrl()
    }
}
