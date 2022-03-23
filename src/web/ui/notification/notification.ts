import {Builder} from '@logi/base/ts/common/builder'

export const enum NotificationType {
    UNKNOWN = 'unknown',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success',
}

export interface Notification {
    readonly type: NotificationType
    readonly main: string
    readonly secondary?: string
}

class NotificationImpl implements Notification {
    public type: NotificationType = NotificationType.UNKNOWN
    public main!: string
    public secondary?: string
}

export class NotificationBuilder
extends Builder<Notification, NotificationImpl> {
    public constructor(obj?: Readonly<Notification>) {
        const impl = new NotificationImpl()
        if (obj)
            NotificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public type(value: NotificationType): this {
        this.getImpl().type = value
        return this
    }

    public main(value: string): this {
        this.getImpl().main = value
        return this
    }

    public secondary(value?: string): this {
        this.getImpl().secondary = value
        return this
    }

    protected get daa(): readonly string[] {
        return NotificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'type',
        'main',
    ]
}

export function isNotification(value: unknown): value is Notification {
    return value instanceof NotificationImpl
}

export function assertIsNotification(
    value: unknown,
): asserts value is Notification {
    if (!(value instanceof NotificationImpl))
        throw Error('Not a Notification!')
}
