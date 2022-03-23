// tslint:disable: max-file-line-count no-magic-numbers unknown-instead-of-any
import {HarnessLoader} from '@angular/cdk/testing'
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed'
import {CommonModule} from '@angular/common'
import {HttpClientModule} from '@angular/common/http'
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {FormsModule} from '@angular/forms'
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatIconModule} from '@angular/material/icon'
import {MatPaginatorModule} from '@angular/material/paginator'
import {MatRadioModule} from '@angular/material/radio'
import {MatRadioButtonHarness} from '@angular/material/radio/testing'
import {MatSortModule} from '@angular/material/sort'
import {MatTableModule} from '@angular/material/table'
import {SpinnerModule} from '@logi/src/web/ui/spinner'

import {ColumnDefDirective} from './column_def.directive'
import {LogiTableComponent} from './component'

describe('Column component (with no slice) test: ', (): void => {
    let fixture: ComponentFixture<LogiTableComponent<any>>
    let component: LogiTableComponent<any>
    let harnessLoader: HarnessLoader
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [
                LogiTableComponent,
                ColumnDefDirective,
            ],
            imports: [
                MatCheckboxModule,
                MatPaginatorModule,
                MatRadioModule,
                MatSortModule,
                MatTableModule,
                SpinnerModule,
                CommonModule,
                FormsModule,
                HttpClientModule,
                HttpClientTestingModule,
                MatIconModule,
            ],
        })
        fixture = TestBed.createComponent(LogiTableComponent)
        harnessLoader = TestbedHarnessEnvironment.loader(fixture)
        component = fixture.componentInstance
    })

    it('single select test', async() => {
        let selectedItems: any[] = []
        component.selectedItemsChange$.subscribe((items: any[]) => {
            selectedItems = items
        })
        component.data = [1, 2, 3]
        component.singleSelect = true
        fixture.detectChanges()
        const radios = await harnessLoader
            .getAllHarnesses(MatRadioButtonHarness)
        expect(radios.length).toBe(3)
        await radios[0].check()
        expect(selectedItems.length).toBe(1)
        expect(selectedItems[0]).toBe(1)
        await radios[1].check()
        expect(selectedItems.length).toBe(1)
        expect(selectedItems[0]).toBe(2)
        await radios[0].check()
        expect(selectedItems.length).toBe(1)
        expect(selectedItems[0]).toBe(1)
    })
})
