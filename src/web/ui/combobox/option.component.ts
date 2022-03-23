import {BooleanInput} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {InputBoolean} from '@logi/src/web/ui/common/utils'
import {SafeAny} from '@logi/src/web/ui/core'
import {Subscription} from 'rxjs'
import {startWith} from 'rxjs/operators'

import {LogiComboboxOptionGroupComponent} from './option-group.component'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    selector: 'logi-combobox-option',
    template: `
<ng-template>
    <ng-content></ng-content>
</ng-template>
`,
})
export class LogiComboboxOptionComponent implements OnInit, OnDestroy {
    public constructor(
        @Optional() private readonly _optionGroup: LogiComboboxOptionGroupComponent,
    ) {}
    public static ngAcceptInputType_disabled: BooleanInput

    @Input() public label: string | null = null
    @Input() public value: SafeAny | null = null
    @Input() @InputBoolean() public disabled = false
    @Input() public hide = false
    @ViewChild(
        TemplateRef,
        {static: true},
    ) public template!: TemplateRef<SafeAny>

    public groupLabel: string | TemplateRef<SafeAny> | null = null

    ngOnInit(): void {
        this._listenGroupChange()
    }

    ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    private _subs = new Subscription()
    private _listenGroupChange(): void {
        if (!this._optionGroup)
            return
        this._subs
            .add(this._optionGroup.changes$.pipe(startWith(true)).subscribe((
            ) => {
                this.groupLabel = this._optionGroup.label
            }))
    }
}
