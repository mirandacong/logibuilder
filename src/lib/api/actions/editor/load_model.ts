import {Builder} from '@logi/base/ts/common/builder'
import {
    Payload,
    RenderPayloadBuilder,
    SetBookPayloadBuilder,
    SetFormulaManagerPayloadBuilder,
    SetModifierManagerPayloadBuilder,
    SetSourceManagerPayloadBuilder,
    SetStdHeaderSetPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {Model} from '@logi/src/lib/model'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly model: Model
    readonly render: boolean,
}

class ActionImpl implements Action {
    public model!: Model
    public actionType = ActionType.LOAD_MODEL
    public render = true
    public getPayloads(): readonly Payload[] {
        const result: Payload[] = []
        result.push(new SetBookPayloadBuilder().book(this.model.book).build())
        result.push(new SetSourceManagerPayloadBuilder()
            .sourceManager(this.model.sourceManager)
            .build())
        result.push(new SetFormulaManagerPayloadBuilder()
            .formulaManager(this.model.formulaManager)
            .build())
        result.push(new SetModifierManagerPayloadBuilder()
            .modifierManager(this.model.modifierManager)
            .build())
        result.push(new SetStdHeaderSetPayloadBuilder()
            .templateSet(this.model.stdHeaderSet)
            .build())
        if (this.render)
            result.push(new RenderPayloadBuilder().build())
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

    public render(render: boolean): this {
        this.getImpl().render = render
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['model']
}
