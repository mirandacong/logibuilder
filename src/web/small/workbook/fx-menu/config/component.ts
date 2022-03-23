import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
    OnInit,
    ViewChild,
} from '@angular/core'
import {MatMenuTrigger} from '@angular/material/menu'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {Base} from '../base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-fx-menu-config',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TopMenuConfigComponent extends Base
    implements OnInit, AfterViewInit {
    public constructor(
        private readonly _nodeEditSvc: NodeEditService,
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public menuOpen = false
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public currType = this.type.CONFIG

    public ngOnInit (): void {
        this.emptyFocus()
    }

    public ngAfterViewInit (): void {
        this.baseInit()
    }

    public onClickLabelManagement (event: Event): void {
        if (this.isEmpty) {
            this.disableBtn(event)
            return
        }
        this._nodeEditSvc.labelManagement()
    }

    public onManageHeader (): void {
        this._nodeEditSvc.deployHeader()
    }
    @ViewChild(MatMenuTrigger) protected menu!: MatMenuTrigger
}
