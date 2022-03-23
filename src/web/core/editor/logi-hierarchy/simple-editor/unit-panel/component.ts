import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    InjectionToken,
} from '@angular/core'
import {HoverInfo} from '@logi/src/lib/intellisense'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'

export const UNIT_PANEL_DATA = new InjectionToken<string>('SUGGESTION_PANEL_DATA')

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-unit-panel',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class UnitPanelComponent {
    public constructor(

        @Inject(UNIT_PANEL_DATA) public readonly info: HoverInfo,
    ) {}
    public trackBy = trackByFnReturnItem
}
