import {Builder} from '@logi/base/ts/common/builder'
import {Observable, of} from 'rxjs'

export interface Action {
    readonly text: string
    // tslint:disable-next-line: prefer-method-signature unknown-instead-of-any
    readonly run: (...args: readonly any[]) => Observable<boolean>
}

export class ActionImpl implements Action {
    public text!: string
    public run = (): Observable<boolean> => of(true)
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    // tslint:disable-next-line: unknown-instead-of-any
    public run(run: (...args: readonly any[]) => Observable<boolean>): this {
        this.getImpl().run = run
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['text']
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
