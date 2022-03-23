import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    InjectionToken,
    Input,
} from '@angular/core'
import {
    FuncHelperResponse,
    HelperPart,
    HelperPartType,
} from '@logi/src/lib/intellisense'

export const FUNCTION_MESSAGE_TOKEN
    = new InjectionToken<FuncHelperResponse>('TOOLTIP_MESSAGE_TOKEN')

const HELPER_PART_CLASS_MAP: Map<HelperPartType, string> = new Map([
    [HelperPartType.NAME, 't-identifier'],
    [HelperPartType.BRACKET, 't-braket'],
    [HelperPartType.COMMON, 't-comma'],
])

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-function-helper',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class FunctionHelperComponent {
    public constructor(
        private readonly _cd: ChangeDetectorRef,

        @Inject(FUNCTION_MESSAGE_TOKEN)
        private readonly _data: FuncHelperResponse,
    ) {
        this.message = this._data
    }
    @Input() public set message(message: FuncHelperResponse) {
        this._message = message
        this._cd.markForCheck()
    }

    // tslint:disable-next-line: ng-no-get-and-set-property
    public get message(): FuncHelperResponse {
        return this._message
    }

    // tslint:disable-next-line: prefer-function-over-method
    public getPartClass(part: HelperPart): string {
        const className = HELPER_PART_CLASS_MAP.get(part.type)
        return className ?? ''
    }

    private _message!: FuncHelperResponse
}
