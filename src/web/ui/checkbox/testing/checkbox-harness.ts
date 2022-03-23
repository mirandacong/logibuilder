// tslint:disable: no-unnecessary-method-declaration async-promise
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion'
import {
  AsyncFactoryFn,
  ComponentHarness,
  HarnessPredicate,
  TestElement,
} from '@angular/cdk/testing'

import {CheckboxHarnessFilters} from './checkbox-harness-filters'

abstract class CheckboxHarnessBase extends ComponentHarness {
    /**
     * Toggles the checked state of the checkbox.
     *
     * Note: This attempts to toggle the checkbox as a user would, by clicking
     * it. Therefore if you are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change
     * the behavior on click, calling this method might not have the expected
     * result.
     */
    public async isChecked(): Promise<boolean> {
        const checked = (await this.input()).getProperty('checked')
        return coerceBooleanProperty(await checked)
    }

    public async isIndeterminate(): Promise<boolean> {
        const indeterminate = (await this.input()).getProperty('indeterminate')
        return coerceBooleanProperty(await indeterminate)
    }

    public async isDisabled(): Promise<boolean> {
        const disabled = (await this.input()).getAttribute('disabled')
        return coerceBooleanProperty(await disabled)
    }

    public async isRequired(): Promise<boolean> {
        const required = (await this.input()).getProperty('required')
        return coerceBooleanProperty(await required)
    }

    public async isValid(): Promise<boolean> {
        const invalid = (await this.host()).hasClass('ng-invalid')
        return !(await invalid)
    }

    public async getName(): Promise<string | null> {
        return (await this.input()).getAttribute('name')
    }

    public async getValue(): Promise<string | null> {
        return (await this.input()).getProperty('value')
    }

    public async getAriaLabel(): Promise<string | null> {
        return (await this.input()).getAttribute('aria-label')
    }

    public async getAriaLabelledby(): Promise<string | null> {
        return (await this.input()).getAttribute('aria-labelledby')
    }

    public async getLabelText(): Promise<string> {
        return (await this.label()).text()
    }

    public async focus(): Promise<void> {
        return (await this.input()).focus()
    }

    public async blur(): Promise<void> {
        return (await this.input()).blur()
    }

    public async isFocused(): Promise<boolean> {
        return (await this.input()).isFocused()
    }

    public abstract toggle(): Promise<void>

  /**
   * Puts the checkbox in a checked state by toggling it if it is currently
   * unchecked, or doing nothing if it is already checked.
   *
   * Note: This attempts to check the checkbox as a user would, by clicking it.
   * Therefore if you are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change the
   * behavior on click, calling this method might not have the expected result.
   */
    public async check(): Promise<void> {
        if (!(await this.isChecked()))
            await this.toggle()
    }

  /**
   * Puts the checkbox in an unchecked state by toggling it if it is currently
   * checked, or doing nothing if it is already unchecked.
   *
   * Note: This attempts to uncheck the checkbox as a user would, by clicking
   * it. Therefore if you are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change the
   * behavior on click, calling this method might not have the expected result.
   */
    public async uncheck(): Promise<void> {
        if (await this.isChecked())
            await this.toggle()
    }
    protected abstract input: AsyncFactoryFn<TestElement>
    protected abstract label: AsyncFactoryFn<TestElement>
}

/**
 * Harness for interacting with a standard mat-checkbox in tests.
 */
export class CheckboxHarness extends CheckboxHarnessBase {
    /**
     * Disable lint here for abstract define
     */
    // tslint:disable-next-line: ext-variable-name
    public static hostSelector = '.logi-checkbox'
    public static with(
        options: CheckboxHarnessFilters = {},
    ): HarnessPredicate<CheckboxHarness> {
        return new HarnessPredicate(CheckboxHarness, options)
            .addOption(
            'label', options.label,
            (harness, label) => HarnessPredicate
                .stringMatches(harness.getLabelText(), label))
            .addOption(
                'name',
                options.name,
                async(harness, name) => await harness.getName() === name,
            )
    }

    public async toggle(): Promise<void> {
        return (await this._inputContainer()).click()
    }

    protected input = this.locatorFor('input')
    protected label = this.locatorFor('.logi-checkbox-label')
    private _inputContainer = this.locatorFor('.logi-checkbox-inner-container')
}
