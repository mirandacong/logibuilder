import {Builder} from '@logi/base/ts/common/builder'
import {getUuid} from '@logi/base/ts/common/uuid'

import {AnnotationKey} from './annotation'

// tslint:disable-next-line: const-enum
export enum Type {
    FX,
    ASSUMPTION,
    FACT,
    CONSTRAINT,
}

export interface SliceExpr {
    readonly uuid: string
    readonly name: string
    readonly expression: string
    readonly annotations: ReadonlyMap<AnnotationKey, string>
    readonly type: Type
}

class SliceExprImpl implements SliceExpr {
    public name!: string
    public expression = ''
    public type = Type.FX
    public annotations = new Map<AnnotationKey, string>()
    public uuid!: string
}

export class SliceExprBuilder extends Builder<SliceExpr, SliceExprImpl> {
    protected get daa(): readonly string[] {
        return SliceExprBuilder.__DAA_PROPS__
    }
    public constructor(obj?: Readonly<SliceExpr>) {
        const impl = new SliceExprImpl()
        if (obj)
            SliceExprBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public expression(expression: string): this {
        this.getImpl().expression = expression
        return this
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    public annotations(annotations: Map<AnnotationKey, string>): this {
        this.getImpl().annotations = annotations
        return this
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['name']
    protected preBuildHook(): void {
        if (this.getImpl().uuid === undefined)
            this.getImpl().uuid = getUuid()
    }
}

export function isSliceExpr(obj: unknown): obj is SliceExpr {
    return obj instanceof SliceExprImpl
}
