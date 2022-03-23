import {Component, DebugElement, NO_ERRORS_SCHEMA} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {By} from '@angular/platform-browser'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {StudioApiService} from '@logi/src/web/global/api'

import {DndService} from './drag_ref'
import {DraggableDirective} from './draggable.directive'
import {DropzoneDirective} from './dropzone.directive'

// tslint:disable: use-component-selector
@Component({
    // tslint:disable-next-line: component-max-inline-declarations
    template: `
    <div logi-dnd-dropzone #drop_par_ref_a>
        <div logi-dnd-draggable
            [dragElement]='drag_col_ref_a'
            [dropzoneElement]='drop_par_ref_a'
            #drag_col_ref_a>
            <div logi-dnd-dropzone #drop_par_ref_b>
                <div logi-dnd-draggable
                    [dragElement]='drag_col_ref_b'
                    [dropzoneElement]='drop_par_ref_b'
                    #drag_col_ref_b></div>
            </div>
        </div>
    </div>
    `,
})
class TestComponent {}

// tslint:disable: max-func-body-length
describe('Test dropZoneDirective', (): void => {
    let fixture: ComponentFixture<TestComponent>
    let dropzone: DebugElement
    let draggableA: DebugElement
    let draggableB: DebugElement
    let dndSvc: DndService

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                DropzoneDirective,
                DraggableDirective,
                TestComponent,
            ],
            providers: [
                DndService,
                {
                    provide: NodeFocusService,
                    useValue: {getSelNodes: () => [], setDragNode: (
                        _: boolean,
                    ) => {}},
                },
                {
                    provide: StudioApiService,
                    useValue: {handleAction: () => {}, getNode: (
                        _: string,
                    ) => {}},
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        })
        fixture = TestBed.createComponent(TestComponent)
        dndSvc = TestBed.inject(DndService)
        const dropAll = fixture.debugElement
            .queryAll(By.directive(DropzoneDirective))
        dropzone = dropAll[1]
        const dragAll = fixture.debugElement
            .queryAll(By.directive(DraggableDirective))
        draggableA = dragAll[0]
        draggableB = dragAll[1]
    })

    it('test isContain', () => {
        fixture.detectChanges()
        const drop = dropzone.injector.get<DropzoneDirective>(DropzoneDirective)
        dndSvc.setDragElement(draggableA.nativeElement)
        expect(drop.isContain()).toBe(true)
        dndSvc.setDragElement(draggableB.nativeElement)
        expect(drop.isContain()).toBe(false)
    })
})
