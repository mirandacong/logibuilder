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
import {Base} from '../base'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-fx-menu-help',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class TopMenuHelpComponent extends Base
    implements OnDestroy, AfterViewInit {
    public constructor(
        public readonly injector: Injector,
    ) {
        super(injector)
    }

    @Input() public menuOpen = false
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public currType = this.type.HELP
    public ngAfterViewInit (): void {
        this.baseInit()
    }

    public ngOnDestroy (): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }
    @ViewChild(MatMenuTrigger) protected menu!: MatMenuTrigger
}
