import {Directive, HostListener, Input} from '@angular/core'

import {ContextMenuComponent} from './component'
import {ContextMenuService} from './service'

@Directive({
    host: {class: 'logi-context-menu-trigger'},
    selector: '[logi-context-menu]',
})
export class ContextMenuAttachDirective {
    public constructor(private readonly _contextMenuSvc: ContextMenuService) {}

    // tslint:disable-next-line: unknown-instead-of-any
    @Input() public contextMenuSubject: any = {}
    @Input() public contextMenu?: ContextMenuComponent

    @HostListener('contextmenu', ['$event'])
    public onContextMenu(event: MouseEvent): void {
        if (this.contextMenu === undefined || this.contextMenu.disabled)
            return
        this._contextMenuSvc.show.next({
            contextMenu: this.contextMenu,
            event,
            item: this.contextMenuSubject,
        })
        event.preventDefault()
        event.stopPropagation()
    }
}
