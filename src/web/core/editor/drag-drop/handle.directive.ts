// tslint:disable: comment-for-export-and-public
import {Directive, HostBinding, HostListener} from '@angular/core'

import {DraggableDirective} from './draggable.directive'
import {DndEvent} from './utils'

@Directive({
    selector: '[logi-dnd-handle]',
})
export class HandleDirective {
    public constructor(
        parent: DraggableDirective,
    ) {
        parent.registerDragHandle(this)
    }
    @HostBinding('attr.draggable') public draggable = true
    @HostListener('dragstart', ['$event'])
    @HostListener('dragend', ['$event'])
    // tslint:disable-next-line: prefer-function-over-method
    public onDragEvent(event: DndEvent): void {
        event.dndUsingHandle = true
    }
}
