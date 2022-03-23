import {Injectable} from '@angular/core'
import {ActionType, MessageType, Notice} from '@logi/src/lib/api'
import {
    NotificationBuilder,
    NotificationService,
    NotificationType,
} from '@logi/src/web/ui/notification'

import {BaseApiService} from './base'

export const NOTIFICATION_TYPE_MAP = new Map<MessageType, NotificationType>([
    [MessageType.UNKNOWN, NotificationType.UNKNOWN],
    [MessageType.SUCCESS, NotificationType.SUCCESS],
    [MessageType.INFO, NotificationType.INFO],
    [MessageType.WARNING, NotificationType.WARNING],
    [MessageType.ERROR, NotificationType.ERROR],
])

const IGNORE_NOTICE: readonly ActionType[] = [
] as const

@Injectable()
export class NoticeService {
    public constructor(
        private readonly _apiSvc: BaseApiService,
        private readonly _notificationSvc: NotificationService,
    ) {
        this._apiSvc.noticeEmitter().subscribe(n => {
            this._handle(n)
        })
    }

    private _handle(notice: Notice): void {
        if (IGNORE_NOTICE.includes(notice.actionType))
            return
        const message = notice.getMessage()
        const type = NOTIFICATION_TYPE_MAP.get(message.type) ||
            NotificationType.INFO
        const notification = new NotificationBuilder()
            .main(message.main)
            .secondary(message.secondary)
            .type(type)
            .build()
        this._notificationSvc.show(notification)
    }
}
