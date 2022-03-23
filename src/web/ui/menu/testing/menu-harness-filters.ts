import {BaseHarnessFilters} from '@angular/cdk/testing'

export interface MenuHarnessFilters extends BaseHarnessFilters {
    readonly triggerText?: string | RegExp
}

export interface MenuItemHarnessFilters extends BaseHarnessFilters {
    readonly text?: string | RegExp
    readonly hasSubmenu?: boolean
}
