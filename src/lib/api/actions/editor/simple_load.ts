import {Builder} from '@logi/base/ts/common/builder'
import {isException} from '@logi/base/ts/common/exception'
import {CommonNoticeBuilder, MessageType} from '@logi/src/lib/api/notice'
import {Payload, RenderPayloadBuilder} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {fromJson} from '@logi/src/lib/model'
import {uint8ArrayToStr} from '@logi/base/ts/common/buffer'
import {Observable, of} from 'rxjs'
import {catchError, map} from 'rxjs/operators'

import {Action as Base} from '../action'
import {getFastLoadPayloads, getSetModelPayloads, openExcel} from '../lib'
import {ActionType} from '../type'

/**
 * Load file action.
 */
export interface Action extends Base {
    readonly buffer: Readonly<Uint8Array>
    readonly excel?: Readonly<Uint8Array>
}

class ActionImpl implements Action {
    public buffer!: Readonly<Uint8Array>
    public excel?: Readonly<Uint8Array>
    public actionType = ActionType.SIMPLE_LOAD

    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    public getPayloads(
        service: EditorService,
    ): readonly Payload[] | Observable<readonly Payload[]> {
        const str = uint8ArrayToStr(this.buffer)
        const model = fromJson(JSON.parse(str) as any)
        if (isException(model)) {
            sendFailed(service)
            return []
        }
        const payloads: Payload[] = []
        payloads.push(...getSetModelPayloads(model))

        if (this.excel === undefined || this.excel.length === 0) {
            const render = new RenderPayloadBuilder().build()
            payloads.push(render)
            return payloads
        }

        return openExcel(this.excel.buffer, service.excel).pipe(
            map(wb => {
                const ps = getFastLoadPayloads(wb)
                payloads.push(...ps)
                return payloads
            }),
            catchError((): Observable<Payload[]> => {
                sendFailed(service)
                return of([])
            }),
        )
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public buffer(buffer: Readonly<Uint8Array>): this {
        this.getImpl().buffer = buffer
        return this
    }

    public excel(excel?: Readonly<Uint8Array>): this {
        this.getImpl().excel = excel
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'buffer',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

function sendFailed(service: EditorService): void {
    const notice = new CommonNoticeBuilder()
        .actionType(ActionType.LOAD_FILE)
        .message(' 打开文件失败，不支持此类格式')
        .type(MessageType.ERROR)
        .build()
    service.noticeEmitter$.next(notice)
}
