/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing'

// tslint:disable-next-line: no-empty-interface
export interface TreeHarnessFilters extends BaseHarnessFilters {}

/**
 * should not add 'id' because website should not show this internal value.
 */
export interface TreeNodeHarnessFilters extends BaseHarnessFilters {
    readonly text?: string | RegExp

    readonly disabled?: boolean

    readonly expanded?: boolean

    readonly level?: number
}
