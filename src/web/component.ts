import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core'
import {IconService} from '@logi/src/web/ui/icon'
import {NotificationService} from '@logi/src/web/ui/notification'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    selector: 'logi-app-component',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class AppComponent implements OnInit, OnDestroy {
    public constructor(
        private readonly _iconSvc: IconService,
        private readonly _notificationSvc: NotificationService,
    ) {
        this._iconSvc.registerAllIcons()
    }

    public ngOnInit(): void {
        window.addEventListener('offline', () => {
            this._networkDown()
        })
    }

    public ngOnDestroy(): void {
        window.removeEventListener('offline', () => {
            this._networkDown()
        })
    }

    private _networkDown(): void {
        this._notificationSvc.showError('网络请求失败，请检查网络设置')
    }
}
