import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core'
import {Column} from '@logi/src/lib/hierarchy/core'
import {Formulabearer} from '@logi/src/web/core/editor/logi-hierarchy/base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-column',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class ColumnComponent extends Formulabearer
    implements OnInit, OnDestroy {
    @Input() public set col(n: Readonly<Column>) {
        if (n === undefined)
            return
        this.node = n
        this.updateNameInput(n.name)
    }
    public constructor(
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public lastNodeInParent!: boolean

    @ViewChild('ref_name', {static: true})
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public refNameInput!: ElementRef<HTMLElement>

    public ngOnDestroy(): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }

    public ngOnInit(): void {
        this.fbInit()
    }

    public columnBlockChild(): boolean {
        const cb = this.node.findParent(this.nodeType.COLUMN_BLOCK)
        return cb !== undefined && this.isColumnBlock(cb)
    }

    public nameChange(): void {
        const native = this.refNameInput.nativeElement
        const name = native.textContent
        if (name === null)
            return
        this.name = name
        this.renameNode()
    }
}
