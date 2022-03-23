import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core'
import {FormulaBearer} from '@logi/src/lib/hierarchy/core'
import {Separator} from '@logi/src/web/core/editor/logi-hierarchy/base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-separator',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SeparatorComponent extends Separator implements OnInit, OnDestroy {
    public constructor(
        private readonly _renderer: Renderer2,
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public lastNodeInParent = false
    @Input() public set fb(fb: Readonly<FormulaBearer>) {
        if (fb === undefined)
            return
        this.node = fb
    }
    @ViewChild('ref_name', {static: true})
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public refNameInput!: ElementRef<HTMLElement>
    public ngOnInit(): void {
        this.fbInit()
        this._renderer.setAttribute(
            this.refNameInput.nativeElement,
            'placeholder',
            `${this.isRow(this.node) ? '分隔行名称' : '分隔列名称'}`,
        )
    }

    public ngOnDestroy(): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }
}
