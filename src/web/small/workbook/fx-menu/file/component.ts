import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
    OnDestroy,
    ViewChild,
} from '@angular/core'
import {MatMenuTrigger} from '@angular/material/menu'
import { LoadFileActionBuilder } from '@logi/src/lib/api'
import {ToolbarBtnType} from '@logi/src/web/core/editor/node-edit/add_list'
import {Base} from '../base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-fx-menu-file',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TopMenuFileComponent extends Base
    implements AfterViewInit, OnDestroy {
    public constructor(
        public readonly injector: Injector,

    ) {
        super(injector)
    }
    @Input() public menuOpen = false
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public currType = this.type.FILE
    public toolbarBtnType = ToolbarBtnType

    public ngAfterViewInit (): void {
        this.baseInit()
    }

    public ngOnDestroy (): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }

    async onUpload(e: Event) {
        const target= e.target as HTMLInputElement
        const file = target.files?.item(0)
        if (!file)
            return
        const ab = await file.arrayBuffer()
        console.log(ab)
        const action = new LoadFileActionBuilder()
            .buffer(new Uint8Array(ab))
            .build()
        this.apiSvc.handleAction(action)
    }

    @ViewChild(MatMenuTrigger) protected menu!: MatMenuTrigger
}
