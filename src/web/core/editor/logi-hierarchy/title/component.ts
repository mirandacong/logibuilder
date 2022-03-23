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
import {NodeType, Title as HierarchyTitle} from '@logi/src/lib/hierarchy/core'
import {Title} from '@logi/src/web/core/editor/logi-hierarchy/base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-title',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TitleComponent extends Title implements OnInit, OnDestroy {
    public constructor(
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public set title(t: Readonly<HierarchyTitle>) {
        if (t === undefined)
            return
        this.node = t
        this.name = t.name
    }

    @ViewChild('container', {static: true})
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public container!: ElementRef<HTMLDivElement>

    public dropZone: ReadonlyArray<string> = [NodeType.TITLE.toString()]

    public ngOnDestroy(): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }

    public ngOnInit(): void {
        this.name = this.node.name
    }
}
