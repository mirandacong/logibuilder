/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import {Observable} from 'rxjs'

export interface TabAnimatedInterface {
    readonly inkBar: boolean
    readonly tabPane: boolean
}

export class TabChangeEvent {
    public index?: number
    // tslint:disable-next-line: unknown-instead-of-any
    public tab: any
}

export type TabsCanDeactivateFn = (fromIndex: number, toIndex: number) =>
    Observable<boolean> | Promise<boolean> | boolean

export type TabPosition = 'top' | 'bottom' | 'left' | 'right'
export type TabPositionMode = 'horizontal' | 'vertical'
export type TabType = 'line' | 'card'
