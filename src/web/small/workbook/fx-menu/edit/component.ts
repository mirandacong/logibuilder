import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core'
import {MatMenuTrigger} from '@angular/material/menu'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {Base} from '../base'
import {Observable} from 'rxjs'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-fx-menu-edit',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TopMenuEditComponent extends Base
    implements OnDestroy, AfterViewInit, OnInit {
    public constructor(
        private readonly _nodeEditSvc: NodeEditService,
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    @Input() public menuOpen = false
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public currType = this.type.EDIT
    public ngOnInit (): void {
        this.emptyFocus()
    }

    public ngAfterViewInit (): void {
        this.baseInit()
    }

    /**
     * The `canUndo`, `canRedo`, 'emptyModel' function can not write like:
     * `public canUndo = this._nodeEditSvc.canUndo`
     * because compiler will throw error:
     * `The inferred type of 'canRedo' cannot be named without a reference to
     * '../../../../../../external/npm/node_modules/rxjs'. This is likely not
     * portable. A type annotation is necessary.`
     * TODO (minglong): resolve this problem.
     */
    public canUndo (): Observable<boolean> {
        return this._nodeEditSvc.canUndo()
    }

    public canRedo (): Observable<boolean> {
        return this._nodeEditSvc.canRedo()
    }

    public ngOnDestroy (): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }

    public onClickUndo (event?: Event): void {
        this._nodeEditSvc.undo()
        this.canUndo().subscribe(b => {
            if (!b)
                event?.stopPropagation()
        })
    }

    public onClickRedo (event: Event): void {
        this._nodeEditSvc.redo()
        this.canRedo().subscribe(b => {
            if (!b)
                event?.stopPropagation()
        })
    }

    public onClickCopy (event: Event): void {
        if (!this.isEmpty)
            this._nodeEditSvc.copy()
        else
            event.stopPropagation()
    }

    public onClickCut (event: Event): void {
        if (!this.isEmpty)
            this._nodeEditSvc.cut()
        else
            event.stopPropagation()
    }

    public onClickPaste (event: Event): void {
        if (!this.isEmpty)
            this._nodeEditSvc.paste()
        else
            event.stopPropagation()
    }

    @ViewChild(MatMenuTrigger) protected menu!: MatMenuTrigger
}
