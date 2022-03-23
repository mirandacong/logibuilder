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
import {isRowBlock, NodeType, Row} from '@logi/src/lib/hierarchy/core'
import {Formulabearer} from '@logi/src/web/core/editor/logi-hierarchy/base'
import {LabelType} from '@logi/src/web/core/editor/logi-hierarchy/label'

import {TooltipService} from './tooltip'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-row',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class RowComponent extends Formulabearer implements
    OnInit, OnDestroy {
    @Input() public set row (r: Readonly<Row>) {
        if (r === undefined)
            return
        this.node = r
        this.updateNameInput(r.name)
        this.validName = r.valid
    }
    public constructor(
        private readonly _tooltipSvc: TooltipService,
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    public validName = true
    public node!: Readonly<Row>
    public labelType = LabelType
    @Input() public lastNodeInParent!: boolean

    @ViewChild('ref_name', {static: true})
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public refNameInput!: ElementRef<HTMLElement>
    public ngOnInit (): void {
        this.fbInit()
    }

    public onMouseOverRefName (): void {
        if (this.node.valid)
            return
        this._tooltipSvc.show(this.refNameInput)
    }

    public onMouseOutRefName (): void {
        this._tooltipSvc.hide()
    }

    /**
     * Listen `blur` in template name input.
     */
    public nameChange (): void {
        const native = this.refNameInput.nativeElement
        const name = native.textContent
        if (name === null)
            return
        this.name = name
        this.renameNode()
    }

    public rowBlockChild (): boolean {
        const block = this.node.findParent(NodeType.ROW_BLOCK)
        return block !== undefined && isRowBlock(block)
    }

    public ngOnDestroy (): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }
}
