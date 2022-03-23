import {Injectable, NgZone, OnDestroy} from '@angular/core'
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar'
import {isString} from '@logi/base/ts/common/type_guard'
import {Subscription} from 'rxjs'

import {NotificationComponent} from './component'
import {SnackBarConfigBuilder} from './config'
import {
    Notification,
    NotificationBuilder,
    NotificationType,
} from './notification'

interface MessageBundle {
    readonly main: string
    readonly secondary?: string
}

@Injectable({providedIn: 'root'})
export class Service implements OnDestroy {
    // tslint:disable-next-line: max-func-body-length
    public constructor(
        private readonly _snackBar: MatSnackBar,
        private readonly _ngZone: NgZone,
    ) {}

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    /**
     * Emit message, and open snack bar.
     */
    public show(notification: Notification, config?: MatSnackBarConfig): void {
        this._openSnackbar(notification, config)
    }

    public showSuccess(message: string, config?: MatSnackBarConfig): void {
        const notification = build(message, NotificationType.SUCCESS)
        this._openSnackbar(notification, config)
    }

    public showInfo(message: string, config?: MatSnackBarConfig): void {
        const notification = build(message, NotificationType.INFO)
        this._openSnackbar(notification, config)
    }

    public showWarning(message: string, config?: MatSnackBarConfig): void {
        const notification = build(message, NotificationType.WARNING)
        this._openSnackbar(notification, config)
    }

    public showError(message: string, config?: MatSnackBarConfig): void {
        const msg = message ?? ''
        const notification = build(msg, NotificationType.ERROR)
        this._openSnackbar(notification, config)
    }

    private _subs = new Subscription()

    private _openSnackbar(n: Notification, config?: MatSnackBarConfig): void {
        const finalConfig = new SnackBarConfigBuilder<Notification>(config)
            .data(n)
            .build()
        /**
         * https://stackoverflow.com/questions/50863572/matsnackbar-position-error-and-hide
         */
        this._ngZone.run(() => {
            this._snackBar.openFromComponent(NotificationComponent, finalConfig)
        })
    }
}

function build(
    value: string | MessageBundle,
    type: NotificationType,
): Notification {
    if (isString(value))
        return new NotificationBuilder().main(value).type(type).build()
    return new NotificationBuilder()
        .main(value.main)
        .secondary(value.secondary)
        .type(type)
        .build()
}
