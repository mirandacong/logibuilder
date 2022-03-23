// tslint:disable: no-type-assertion remove-import-comment no-magic-numbers
import {CommonModule} from '@angular/common'
import {TestBed} from '@angular/core/testing'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatIcon, MatIconModule} from '@angular/material/icon'
import {
    MatSnackBarModule,
    MatSnackBarRef,
    MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {assertIsDefined} from '@logi/base/ts/common/assert'
import {IconComponent} from '@logi/src/web/testing'

import {NotificationComponent} from './component'
import {Service} from './service'

// tslint:disable-next-line: max-func-body-length
describe('Template component test: ', (): void => {
    let service: Service

    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [
                    NotificationComponent,
                ],
                imports: [
                    CommonModule,
                    MatButtonModule,
                    BrowserAnimationsModule,
                    MatSnackBarModule,
                    MatIconModule,
                    MatRippleModule,
                ],
                providers: [
                    Service,
                    {provide: MAT_SNACK_BAR_DATA, useValue: {}},
                    {provide: MatSnackBarRef, useValue: {}},
                ],
            })
            .overrideModule(MatIconModule, {
                add: {
                    declarations: [IconComponent],
                    exports: [IconComponent],
                },
                remove: {
                    declarations: [MatIcon],
                    exports: [MatIcon],
                },
            })
        service = TestBed.inject(Service)
    })
    it('test normal', (): void => {
        service.showSuccess('保存成功！')
        const main = getElement('.main')
        assertIsDefined<HTMLElement>(main)
        expect(main.textContent).toBe('保存成功！')
        const container = getElement('.container')
        assertIsDefined<HTMLElement>(container)
        expect(container.classList.contains('success')).toBe(true)
    })
    function getElement(selector: string): Element | null {
        return document.querySelector(selector)
    }
})
