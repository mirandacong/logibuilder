import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
/**
 * Indicate a hierarchy object who owns a expression. (Fb of slice)
 */
export interface ExprBearer {
    readonly uuid: string
    readonly sliceName?: string
}

class ExprBearerImpl implements Impl<ExprBearer> {
    public uuid!: string
    public sliceName?: string
}

export class ExprBearerBuilder extends Builder<ExprBearer, ExprBearerImpl> {
    public constructor(obj?: Readonly<ExprBearer>) {
        const impl = new ExprBearerImpl()
        if (obj)
            ExprBearerBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    public sliceName(sliceName?: string): this {
        this.getImpl().sliceName = sliceName
        return this
    }

    protected get daa(): readonly string[] {
        return ExprBearerBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['uuid']
}
