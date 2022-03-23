import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Inject,
    OnDestroy,
} from '@angular/core'
import {AbstractControl, FormControl} from '@angular/forms'
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'
import {emptyValidator, LOGI_EMPTY_ERROR_KEY} from '@logi/src/web/base/form'
import {Action, ActionBuilder} from '@logi/src/web/ui/common/action'
import {Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {
    assertIsInputDialogData,
    InputDialogData,
    ValidatorRules,
} from './dialog_data'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-input-dialog',
    styleUrls: ['./input.style.scss'],
    templateUrl: './input.template.html',
})
export class InputDialogComponent implements OnDestroy {
    // tslint:disable-next-line: max-func-body-length
    public constructor(
        private readonly _cd: ChangeDetectorRef,

        @Inject(MAT_DIALOG_DATA)
        public readonly data: InputDialogData,
        private readonly _dialogRef: MatDialogRef<InputDialogComponent>,
    ) {
        assertIsInputDialogData(this.data)
        this.primaryAction = this.data.buttonGroup.primary
        if (this.data.buttonGroup.secondary.length !== 0)
            this.secondaryActions = this.data.buttonGroup.secondary

        this._rules = {
            [LOGI_EMPTY_ERROR_KEY]: {
                message: '名称不能为空',
                validator: emptyValidator,
            },
            ...this.data.rules,
        }
        const arr = [
            emptyValidator,
            // tslint:disable-next-line: no-object
            ...Object.keys(this._rules).map(key => this._rules[key].validator),
        ]
        this.control = new FormControl('', arr)
        this.control.setValue(this.data.value)
    }

    public control: FormControl
    public primaryAction?: Action
    public secondaryActions: readonly Action[] = [
        new ActionBuilder().text('取消').build(),
    ]
    public loading = false

    public ngOnDestroy(): void {
        this._destroyed$.next()
        this._destroyed$.complete()
    }

    public getControlError(): string {
        // tslint:disable-next-line: no-object
        const keys = Object.keys(this._rules)
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i]
            if (this.control?.errors && this.control.errors[key])
                return this._rules[key].message
        }
        return ''
    }

    @HostListener('keyup.enter')
    public onEnter(): void {
        if (this.primaryAction === undefined || this.control.invalid)
            return
        this.onClickPrimary(this.primaryAction)
    }

    public onClickPrimary(action: Action): void {
        this.loading = true
        action
            .run(this.control.value)
            .pipe(takeUntil(this._destroyed$))
            .subscribe(res => {
                this.loading = false
                this._cd.markForCheck()
                if (res)
                    this._dialogRef.close()
            },
        )
    }

    public onClickSecondary(action: Action): void {
        if (action === undefined) {
            this._dialogRef.close()
            return
        }
        action.run().pipe(takeUntil(this._destroyed$)).subscribe(res => {
            if (res)
                this._dialogRef.close()
        })
    }

    // tslint:disable-next-line: prefer-function-over-method
    public isControlInvalid(control: AbstractControl | null): boolean {
        return control !== null && control.invalid &&
            (control.dirty || control.touched)
    }

    private readonly _destroyed$ = new Subject<void>()
    private _rules!: ValidatorRules
}
