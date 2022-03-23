import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    InjectionToken,
} from '@angular/core'
export const TOOLTIP_MESSAGE_TOKEN
    = new InjectionToken<string>('ROW_NAME_TOOLTIP_MESSAGE_TOKEN')

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-tooltip',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TooltipComponent {
    public constructor(

        @Inject(TOOLTIP_MESSAGE_TOKEN) public readonly message: string,
    ) {}
}
