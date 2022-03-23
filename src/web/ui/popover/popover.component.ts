import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core'

import {
    LogiPopoverPanel,
    PopoverPositionX,
    PopoverPositionY,
} from './popover_panel'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'logiPopover',
    selector: 'logi-popover',
    styleUrls: ['./popover.style.scss'],
    templateUrl: './popover.template.html',
})
export class LogiPopoverComponent implements LogiPopoverPanel {
    @Input() public positionX?: PopoverPositionX
    @Input() public positionY?: PopoverPositionY
    @Output() readonly mouseenter$ = new EventEmitter<void>()
    @Output() readonly mouseleave$ = new EventEmitter<void>()

    @ViewChild(TemplateRef, {static: true})
     public readonly templateRef!: TemplateRef<unknown>

    onMouseenter(): void {
        this.mouseenter$.next()
    }

    onMouseleave(): void {
        this.mouseleave$.next()
    }
}
