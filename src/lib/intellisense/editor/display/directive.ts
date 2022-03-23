import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node} from '@logi/src/lib/hierarchy/core'

/**
 * This response tells frontend not to change the current display but
 * to do some actions.
 */
export interface DirectiveResponse {
    readonly directive: DirectiveType
    /**
     * The extra information to help frontend do the directive.
     */
    readonly data?: string | readonly Readonly<Node>[]
}

class DirectiveResponseImpl implements Impl<DirectiveResponse> {
    public directive!: DirectiveType
    public data?: string | readonly Readonly<Node>[]
}

export class DirectiveResponseBuilder
    extends Builder<DirectiveResponse, DirectiveResponseImpl> {
    public constructor(obj?: Readonly<DirectiveResponse>) {
        const impl = new DirectiveResponseImpl()
        if (obj)
            DirectiveResponseBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public directive(directive: DirectiveType): this {
        this.getImpl().directive = directive
        return this
    }

    public data(data: string | readonly Readonly<Node>[]): this {
        this.getImpl().data = data
        return this
    }

    protected get daa(): readonly string[] {
        return DirectiveResponseBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['directive']
}

export function isDirectiveResponse(obj: unknown): obj is DirectiveResponse {
    return obj instanceof DirectiveResponseImpl
}

export const enum DirectiveType {
    // Copy the the selected string. `string` should be provided.
    COPY,
    // Cut the the selected string. `string` should be provided.
    CUT,
    NONE,
    // Save the hierarchy book.
    SAVE,
    // Trace to this hierarchy node. `node` should be provided.
    TRACE,
    // Skip to the next row.
    SKIP_NEXT,
    // Skip to the last row.
    SKIP_LAST,
    // Skip to the row name or slice home.
    SKIP_BACK,
    // To exit the edit mode.
    BLUR,
}
