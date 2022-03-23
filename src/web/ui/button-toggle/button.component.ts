import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    ViewEncapsulation,
} from '@angular/core'

import {LogiButtonToggleGroupDirective} from './group.directive'

// tslint:disable: unknown-instead-of-any
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-button-toggle',
    },
    selector: 'logi-button-toggle',
    styleUrls: ['./button.style.scss'],
    templateUrl: './button.template.html',
})
export class LogiButtonToggleComponent<T> implements OnInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        @Optional() private readonly _group: LogiButtonToggleGroupDirective<T>,
    ) {}

    // tslint:disable-next-line: ext-variable-name variable-name
    public static ngAcceptInputType_selected: BooleanInput

    @Input() public value?: T
    @Input() public set selected(value: boolean) {
        const newValue = coerceBooleanProperty(value)
        if (newValue === this._selected)
            return
        this._selected = newValue
        if (this._group)
            this._group.syncButtonToggle(this, this._selected)
        this._cd.markForCheck()
    }

    public get selected(): boolean {
        return this._group ? this._group.isSelected(this) : this._selected
    }

    public ngOnInit(): void {
        if (this._group && this._group.isPreselected(this))
            this.selected = true
    }

    public ngOnDestroy(): void {
        if (this._group && this._group.isSelected(this))
            this._group.syncButtonToggle(this, false)
    }

    public onClick(): void {
        if (this._selected)
            return
        this._selected = true
        if (this._group)
            this._group.syncButtonToggle(this, this._selected, true)
    }

    private _selected = false
}
