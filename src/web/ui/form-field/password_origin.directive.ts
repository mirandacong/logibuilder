import {Directive, Input} from '@angular/core'
import {togglePasswordInputType} from '@logi/src/web/base/utils'

/**
 * Directive for toggle the input type between text and password.
 */
@Directive({
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '(click)': 'onClick()',
    },
    // tslint:disable-next-line: directive-selector
    selector: '[logiPasswordOrigin]',
})
export class LogiPasswordOriginDirective {
    @Input() public logiPasswordOrigin!: HTMLInputElement

    public onClick(): void {
        if (!this.logiPasswordOrigin)
            return
        const type = this.logiPasswordOrigin.type
        if (type !== 'text' && type !== 'password')
            return
        togglePasswordInputType(this.logiPasswordOrigin)
    }
}
