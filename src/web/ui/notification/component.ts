import {ChangeDetectionStrategy, Component, Inject} from '@angular/core'
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar'

import {Notification, NotificationType} from './notification'

const ICON_MAP = new Map<NotificationType, string>([
    [NotificationType.SUCCESS, 'ic_success'],
    [NotificationType.INFO, 'ic_alert_circle'],
    [NotificationType.WARNING, 'ic_alert_circle'],
    [NotificationType.ERROR, 'ic_error'],
])

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-notification',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class NotificationComponent {
    public constructor(

        @Inject(MAT_SNACK_BAR_DATA)
        private readonly _data: Notification,
    ) {
        this.notification = this._data
        this.icon = ICON_MAP.get(this._data.type) || ''
    }

    public notification: Notification
    public icon: string
}
