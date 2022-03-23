import {Directive, Input, OnInit, TemplateRef} from '@angular/core'

import {DndService} from './drag_ref'

@Directive({selector: '[logi-dnd-image]'})
/**
 * Drag image directive.
 */
export class DndImageDirective implements OnInit {
    public constructor(
        private readonly _svc: DndService,
    ) {}
    @Input() public uuid?: string
    // tslint:disable-next-line: unknown-instead-of-any
    @Input() public image?: TemplateRef<any>
    public ngOnInit(): void {
        if (this.uuid === undefined || this.image === undefined)
            return
        this._svc.getOrSetDragImages(this.uuid, this.image)
    }
}
