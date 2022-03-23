import {ChangeDetectionStrategy, Component} from '@angular/core'
import {
    Service as LocationService,
} from '@logi/src/web/core/logi-docsite/views/services/location/service'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-page-nav',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class PageNavComponent {
    public constructor(private readonly _locationSvc: LocationService) {}

    public next(): void {
        this._locationSvc.prevOrNext('next')
    }

    public prev(): void {
        this._locationSvc.prevOrNext('prev')
    }
}
