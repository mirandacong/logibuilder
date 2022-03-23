// tslint:disable: max-file-line-count
// tslint:disable: no-type-assertion
import {OverlayContainer, OverlayModule} from '@angular/cdk/overlay'
import {HttpClientModule} from '@angular/common/http'
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {ComponentFixture, inject, TestBed} from '@angular/core/testing'
import {MatDialogModule} from '@angular/material/dialog'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {MatTooltipModule} from '@angular/material/tooltip'
import {
    Book,
    BookBuilder,
    ColumnBuilder,
    Row,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    DisplayResponse,
    EditorDisplayUnitBuilder,
    EditorMouseEvent,
    EditorResponseBuilder,
    Event as EditorEvent,
    FuncHelperResponseBuilder,
    HelperPart,
    HelperPartBuilder,
    HelperPartType,
    PanelItemBuilder,
    PanelResponseBuilder,
    PanelTabBuilder,
    UnitType,
    ViewPartBuilder,
    ViewType,
} from '@logi/src/lib/intellisense'
import {getUnitClass} from '@logi/src/lib/visualizer'
import {getElementRange, replaceNbsp} from '@logi/src/web/base/editor'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {StudioApiService} from '@logi/src/web/global/api'
import {
    createMouseEvent,
    dispatchEvent,
    RunHelpers,
} from '@logi/src/web/testing'
import {Observable, Subscriber, TeardownLogic} from 'rxjs'
import {TestScheduler} from 'rxjs/testing'

import {SimpleEditorComponent} from './component'
import {SuggestionPanelService} from './suggestion-panel'
import {$getObservable, $setObservable, ObservableName} from './test_tool'

// tslint:disable: no-magic-numbers
// tslint:disable-next-line: max-func-body-length
describe('Test simple editor', (): void => {
    let fixture: ComponentFixture<SimpleEditorComponent>
    let component: SimpleEditorComponent
    let testScheduler: TestScheduler
    let exprRow: Row
    let nodeFocusSvc: NodeFocusService
    let apiSvc: StudioApiService

    beforeEach((): void => {
        testScheduler = new TestScheduler(
        // tslint:disable-next-line: no-any
        (actual: unknown, expected: unknown): void => {
            expect(actual).toEqual(expected)
        })
        const book = buildTestBook()
        const table = book.sheets[0].tree[0] as Table
        /**
         * Row in logi3 with expresstion '{row1}+{row2}'
         */
        exprRow = table.rows[0] as Row
    })
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [SimpleEditorComponent],
            imports: [
                HttpClientModule,
                MatDialogModule,
                HttpClientTestingModule,
                MatTooltipModule,
                MatSnackBarModule,
                OverlayModule,
                EditorTestModule,
            ],
            providers: [
                SuggestionPanelService,
            ],
        })

        fixture = TestBed.createComponent(SimpleEditorComponent)
        component = fixture.componentInstance
        getContainer().setAttribute('contenteditable', 'true')
        nodeFocusSvc = TestBed.inject(NodeFocusService)
        spyOn(nodeFocusSvc, 'isSelected').and.returnValue(true)
        spyOn(nodeFocusSvc, 'isInfoFocus').and.returnValue(true)
        apiSvc = TestBed.inject(StudioApiService)
    })

    afterEach(inject(
        [OverlayContainer],
        (currentOverlayContainer: OverlayContainer): void => {
        /**
         * It MUST clean the overlay after each test item, or it will cause test
         * instability.
         */
            fixture.debugElement.injector
                .get(SuggestionPanelService)
                .closePanel()
        /**
         * Reference from material autocomplete unit test.
         */
        // tslint:disable-next-line: no-lifecycle-call
            currentOverlayContainer.ngOnDestroy()
        },
    ))

    function getContainer(): HTMLElement {
        const element = fixture.elementRef.nativeElement
        expect(element).toBeDefined()
        return element as HTMLElement
    }

    it('it should display initial expression', (): void => {
        component.node = exprRow
        fixture.detectChanges()
        const container = getContainer()
        const content = container.textContent || ''
        expect(replaceNbsp(content)).toBe('row1 + row2')
        expect(container.children.length).toBe(5)
        const refClass = getUnitClass(UnitType.REF) || ''
        const opClass = getUnitClass(UnitType.OP) || ''
        expect(container.children[0].classList.contains(refClass)).toBe(true)
        expect(container.children[2].classList.contains(opClass)).toBe(true)
    })

    it('mousedown and mouseup event', (): void => {
        component.node = exprRow
        fixture.detectChanges()
        let editorEvent: EditorEvent | undefined
        $getObservable<EditorEvent>(component, ObservableName.EDITOR_EVENT)
            .subscribe((e: EditorEvent): void => {
                editorEvent = e
            })
        /**
         * |<===========================|
         * r o w 1          +            r o w 2
         * -------    -     -      -     -------
         * child0  child1 child2 child3  child4
         */
        const target1 = getContainer().children[4]
        const clientX1 = target1.getBoundingClientRect().left
        const clientY1 = target1.getBoundingClientRect().top
        const mousedownEvent = createMouseEvent('mousedown', clientX1, clientY1)
        dispatchEvent(target1, mousedownEvent)

        const target2 = getContainer().children[0]
        const clientX2 = target2.getBoundingClientRect().left
        const clientY2 = target2.getBoundingClientRect().top
        const mouseupEvent = createMouseEvent('mouseup', clientX2, clientY2)
        dispatchEvent(target2, mouseupEvent)

        expect(editorEvent).toBeDefined()
        const clickEvent = editorEvent as EditorMouseEvent
        expect(clickEvent.editorText.length).toBe(5)
        expect(clickEvent.startOffset).toBe(7)
        expect(clickEvent.endOffset).toBe(0)
    })

    it('it should not update expression after foucs and blur', (): void => {
        component.node = exprRow
        fixture.detectChanges()
        spyOn(apiSvc, 'handleAction')
        const container = fixture.elementRef.nativeElement as HTMLElement
        container.setAttribute('contenteditable', 'true')
        const target1 = getContainer().children[4]
        const clientX1 = target1.getBoundingClientRect().left
        const clientY1 = target1.getBoundingClientRect().top
        const mousedownEvent = createMouseEvent('mousedown', clientX1, clientY1)
        dispatchEvent(target1, mousedownEvent)

        const target2 = getContainer().children[0]
        const clientX2 = target2.getBoundingClientRect().left
        const clientY2 = target2.getBoundingClientRect().top
        const mouseupEvent = createMouseEvent('mouseup', clientX2, clientY2)
        dispatchEvent(target2, mouseupEvent)
        const focusContent = container.textContent || ''
        expect(replaceNbsp(focusContent)).toBe('{row1} + {row2}')
        dispatchEvent(container, new Event('blur'))
        const blurContent = container.textContent || ''
        expect(replaceNbsp(blurContent)).toBe('row1 + row2')
        expect(component.node.expression).toBe('{row1} + {row2}')
        expect(apiSvc.handleAction).toHaveBeenCalledTimes(0)
    })

    it('should set caret position', (): void => {
        testScheduler.run(({hot, flush}: RunHelpers): void => {
            component.node = new RowBuilder().name('').build()
            const units = [
                new EditorDisplayUnitBuilder()
                    .indivisible(false)
                    .content('source()')
                    .tags([UnitType.IDENTIFIER])
                    .build(),
            ]
            const response = new EditorResponseBuilder()
                .content(units)
                .startOffset(1)
                .endOffset(4)
                .build()
            const response$ = Observable
                .create((subscriber: Subscriber<DisplayResponse>):
                TeardownLogic => {
                    subscriber.next(response)
                    subscriber.complete()
                })
            const response$$ = hot('-x|', {x: response$})
            $setObservable(component, ObservableName.RESPONSE, response$$)
            fixture.detectChanges()
            flush()
            const container = getContainer()
            const range = getElementRange(container)
            expect(range.start).toBe(1)
            expect(range.end).toBe(4)
        })
    })

    // tslint:disable-next-line: max-func-body-length
    it('should show hover message', (): void => {
        testScheduler.run(({hot, flush}: RunHelpers): void => {
            component.node = new RowBuilder().name('').build()
            const units = [
                new EditorDisplayUnitBuilder()
                    .indivisible(false)
                    .content('SU')
                    .hoverInfo(
                        {message: 'not support', resolvedNodes: [], type: 1},
                    )
                    .tags([UnitType.FUNC_ERROR])
                    .build(),
                new EditorDisplayUnitBuilder()
                    .indivisible(false)
                    .content('(')
                    .tags([UnitType.BRA])
                    .build(),
                new EditorDisplayUnitBuilder()
                    .indivisible(false)
                    .content(')')
                    .tags([UnitType.KET])
                    .build(),
            ]
            const response = new EditorResponseBuilder()
                .content(units)
                .startOffset(-1)
                .endOffset(-1)
                .build()
            const response$ = Observable
                .create((subscriber: Subscriber<DisplayResponse>):
                TeardownLogic => {
                    subscriber.next(response)
                    subscriber.complete()
                })
            const response$$ = hot('-x|', {x: response$})
            $setObservable(component, ObservableName.RESPONSE, response$$)
            fixture.detectChanges()
            flush()
            const firstUnitEl = fixture.elementRef.nativeElement
                .querySelector('span')
            expect(firstUnitEl).not.toBeNull()
            if (firstUnitEl === null)
                return
            dispatchEvent(firstUnitEl, new Event('mouseover', {bubbles: true}))
            fixture.detectChanges()
            const hoverMsg = document.querySelector('logi-unit-panel .message')
            expect(hoverMsg).not.toBeNull()
            if (hoverMsg === null)
                return
            expect(hoverMsg.textContent).toBe('not support')
        })
    })

    it('should display function tips(helper)', (): void => {
        testScheduler.run(({hot, flush}: RunHelpers): void => {
            component.node = new RowBuilder().name('').build()
            const parts: readonly HelperPart[] = [
                new HelperPartBuilder()
                    .content('sum')
                    .type(HelperPartType.NAME)
                    .build(),
                new HelperPartBuilder()
                    .content('(')
                    .type(HelperPartType.BRACKET)
                    .build(),
                new HelperPartBuilder()
                    .content('number')
                    .type(HelperPartType.REQ_ARG)
                    .isCurrent(true)
                    .build(),
                new HelperPartBuilder()
                    .content(')')
                    .type(HelperPartType.BRACKET)
                    .build(),
            ]
            const response = new FuncHelperResponseBuilder()
                .description('description')
                .parts(parts)
                .build()
            const response$ = Observable
                .create((subscriber: Subscriber<DisplayResponse>):
                TeardownLogic => {
                    subscriber.next(response)
                    subscriber.complete()
                })
            const response$$ = hot('-x|', {x: response$})
            $setObservable(component, ObservableName.RESPONSE, response$$)
            fixture.detectChanges()
            flush()
            fixture.detectChanges()
            const partSelector = 'logi-function-helper .part'
            const partElements = document.querySelectorAll(partSelector)
            expect(partElements.length).toBe(parts.length)
            const currentPartSelector = 'logi-function-helper .part.current'
            const currentPart = document.querySelector(currentPartSelector)
            expect(currentPart).not.toBeNull()
            if (currentPart === null)
                return
            expect(currentPart.textContent).toBe('number')
        })
    })

    it('should display suggestion panel when having tabs response', (
    ): void => {
        testScheduler.run(({hot, flush}: RunHelpers): void => {
            component.node = new RowBuilder().name('').build()
            const parts = [
                new ViewPartBuilder()
                    .content('source')
                    .matchedMap(new Map<number, number>([[0, 0]]))
                    .type(ViewType.FUNCTION)
                    .build(),
            ]
            const tab = new PanelTabBuilder()
                .items([new PanelItemBuilder().parts(parts).build()])
                .build()
            const response = new PanelResponseBuilder().tab(tab).build()
            const response$ = Observable
                .create((subscriber: Subscriber<DisplayResponse>):
                TeardownLogic => {
                    subscriber.next(response)
                    subscriber.complete()
                })
            const response$$ = hot('-x|', {x: response$})
            $setObservable(component, ObservableName.RESPONSE, response$$)
            fixture.detectChanges()
            flush()
            fixture.detectChanges()
            const panel = document.querySelectorAll('logi-suggestion')
            expect(panel.length).toBe(1)
            const items = panel[0].querySelectorAll('.tab-item-container')
            expect(items.length).toBe(1)
        })
    })

    it('should not display panel when response have no tabs', (): void => {
        testScheduler.run(({hot, flush}: RunHelpers): void => {
            component.node = new RowBuilder().name('').build()
            const response = new PanelResponseBuilder()
                .tab(new PanelTabBuilder().build())
                .build()
            const response$ = Observable
                .create((subscriber: Subscriber<DisplayResponse>):
                TeardownLogic => {
                    subscriber.next(response)
                    subscriber.complete()
                })
            const response$$ = hot('-x|', {x: response$})
            $setObservable(component, ObservableName.RESPONSE, response$$)
            fixture.detectChanges()
            flush()
            const panel = document.querySelectorAll('logi-suggestion')
            expect(panel.length).toBe(0)
        })
    })
})

function buildTestBook(): Readonly<Book> {
    const column = new ColumnBuilder().name('column').build()
    const row = new RowBuilder()
        .name('row')
        .expression('{row1} + {row2}')
        .build()
    const table = new TableBuilder()
        .name('table')
        .subnodes([column, row])
        .build()
    const sheet = new SheetBuilder().name('sheet').tree([table]).build()
    return new BookBuilder().name('book').sheets([sheet]).build()
}
