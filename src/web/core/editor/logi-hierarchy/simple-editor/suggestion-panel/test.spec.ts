import {ComponentFixture, TestBed} from '@angular/core/testing'

import {SuggestionComponent, SUGGESTION_PANEL_DATA} from './component'
import {PanelData} from './panel_data'

describe('suggestion panel test', () => {
    let fixture: ComponentFixture<SuggestionComponent>
    let component: SuggestionComponent
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SuggestionComponent],
            providers: [
                {provide: SUGGESTION_PANEL_DATA, useValue: mockPanelData()},
            ],
        })
        fixture = TestBed.createComponent(SuggestionComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('suggestion item scroll into view', () => {
        const scrollElement = component.getScrollElement()
        expect(scrollElement.scrollTop).toBe(0)
        const index = 8
        component.updatePanelData(mockPanelData(index))
        fixture.detectChanges()
        expect(scrollElement.scrollTop).toBeGreaterThan(0)
    })
})

/**
 * TODO (zengkai): The component should have its own interface instead of
 * depending on interface from src/lib.
 */
function mockPanelData(index = 7): PanelData {
    const itemNum = 10
    const items = Array(itemNum).fill(undefined).map(() => {
        return {parts: [{content: 'test', matchedMap: new Map(), type: 0}]}
    })
    return {
        items,
        offset: 0,
        selectedIndex: index,
    }
}
