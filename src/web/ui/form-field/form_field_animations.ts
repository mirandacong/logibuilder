/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations'

// tslint:disable-next-line: naming-convention
export const matFormFieldAnimations: {
    readonly transitionMessages: AnimationTriggerMetadata,
} = {
    transitionMessages: trigger('transitionMessages', [
        state('enter', style({
            opacity: 1,
            transform: 'translateY(0%)',
        })),
        transition('void => enter', [style({
            opacity: 0,
            transform: 'translateY(-100%)',
        }), animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)')]),
    ]),
}
