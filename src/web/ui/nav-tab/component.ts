import {ChangeDetectionStrategy, Component, Input} from '@angular/core'

export interface RouteItem {
    readonly path: string
    readonly text?: string
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-nav-tab',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class NavTabComponent {
    @Input() public routeItems!: readonly RouteItem[]
    @Input() public hasBkgColor = true
}
