import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    AddSheetPayloadBuilder,
    Payload,
    RemoveSheetPayloadBuilder,
    SetSourcePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {Model} from '@logi/src/lib/model'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly model: Model
}

class ActionImpl implements Impl<Action> {
    public model!: Model
    public actionType = ActionType.ADD_MODEL
    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const result: Payload[] = []
        this.model.book.sheets.forEach(s => {
            const idx = service.excel.getSheetIndex(s.name)
            const hiePos = service.sheetTabs().sheetTabs
                .slice(0, idx)
                .filter(t => !t.isCustom).length
            result.push(new RemoveSheetPayloadBuilder()
                .name(s.name)
                .index(idx)
                .build())
            result.push(new AddSheetPayloadBuilder()
                .name(s.name)
                .hierarchyPos(hiePos)
                .position(idx)
                .sheet(s)
                .build())
        })
        const sm = this.model.sourceManager
        sm.gc(this.model.book)
        sm.data.forEach(item => {
            result.push(new SetSourcePayloadBuilder()
                .row(item.row)
                .col(item.col)
                .source(item.source)
                .build())
        })
        return result
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public model(model: Model): this {
        this.getImpl().model = model
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'model',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
