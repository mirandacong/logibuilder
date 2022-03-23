// tslint:disable: no-unnecessary-method-declaration
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    coerceBooleanProperty,
    coerceNumberProperty,
} from '@angular/cdk/coercion'
import {
    ComponentHarnessConstructor,
    ContentContainerComponentHarness,
    HarnessPredicate,
    TestElement,
} from '@angular/cdk/testing'

import {TreeNodeHarnessFilters} from './tree-harness-filters'

export class TreeNodeHarness extends
    ContentContainerComponentHarness<string> {
    // tslint:disable-next-line: ext-variable-name
    public static hostSelector = '.logi-tree-node, .logi-nested-tree-node'

    public static with(
        options: TreeNodeHarnessFilters = {},
    ): HarnessPredicate<TreeNodeHarness> {
        return getNodePredicate(TreeNodeHarness, options)
    }

    public async isExpanded(): Promise<boolean> {
        return coerceBooleanProperty(await (await this.host())
            .getAttribute('aria-expanded'))
    }

    public async isDisabled(): Promise<boolean> {
        return coerceBooleanProperty(await (await this.host())
            .getProperty('aria-disabled'))
    }

    public async getLevel(): Promise<number> {
        return coerceNumberProperty(await (await this.host())
            .getAttribute('aria-level'))
    }

    public async getText(): Promise<string> {
        return (await this.host())
            .text({exclude: '.logi-tree-node, .logi-nested-tree-node, button'})
    }

    public async hostClick(): Promise<void> {
        return (await this.host()).click()
    }

    public async expand(): Promise<void> {
        if (!(await this.isExpanded())) {
            const btn = await this._toggleBtn()
            await btn?.click()
        }
    }

    public async collapse(): Promise<void> {
        if (await this.isExpanded()) {
            const btn = await this._toggleBtn()
            await btn?.click()
        }
    }

    private async _toggleBtn(): Promise<TestElement | null> {
        return await this.locatorForOptional('.toggle-btn')()
    }
}

function getNodePredicate<T extends TreeNodeHarness>(
    type: ComponentHarnessConstructor<T>,
    options: TreeNodeHarnessFilters,
): HarnessPredicate<T> {
    return new HarnessPredicate(type, options)
        .addOption('text', options.text,
            (
                harness,
                text,
            ) => HarnessPredicate.stringMatches(harness.getText(), text))
        .addOption(
            'disabled', options.disabled,
            async(harness, disabled) => (await harness
                .isDisabled()) === disabled)
        .addOption(
            'expanded', options.expanded,
            async(harness, expanded) => (await harness
                .isExpanded()) === expanded)
        .addOption(
            'level',
            options.level,
            async(harness, level) => (await harness.getLevel()) === level,
        )
}
