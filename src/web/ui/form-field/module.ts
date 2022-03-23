import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {LogiFormFieldComponent} from './form_field.component'
import {LogiPasswordOriginDirective} from './password_origin.directive'
import {LogiPrefixDirective} from './prefix.directive'
import {LogiSuffixDirective} from './suffix.directive'

@NgModule({
    declarations: [
        LogiFormFieldComponent,
        LogiPasswordOriginDirective,
        LogiPrefixDirective,
        LogiSuffixDirective,
    ],
    exports: [
        LogiFormFieldComponent,
        LogiPasswordOriginDirective,
        LogiPrefixDirective,
        LogiSuffixDirective,
    ],
    imports: [
        CommonModule,
    ],
})
export class LogiFormFieldModule {}
