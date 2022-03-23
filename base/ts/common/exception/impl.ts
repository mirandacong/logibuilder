import {Builder} from '@logi/base/ts/common/builder'

/**
 * Export this class rather than export an interface because it is necessary to
 * use `instanceOf` to figure out that if the output of a function is an
 * exception, for instance,
 *      ``` typescript
 *      function lex(input: string): Token[] | Exception {}
 *      const result = lex('source()')
 *      if (isException(result))
 *          // do something to do with exception
 *      const tokens = result as Token[]
 *      // do something to do with tokens
 *      ```
 */
export class Exception {
    public readonly type: Type = Type.OTHER
    public readonly message!: string
    /**
     * Use to record the corresponding exception data. For example, in csfSheet
     * `info` is a hierarchy node.
     */
    public readonly info!: ExceptionInfo
    protected constructor() {}
}

export function isException(obj: unknown): obj is Exception {
    return obj instanceof Exception
}

export function assertIsException(
    obj: unknown,
): asserts obj is Readonly<Exception> {
    if (!(obj instanceof Exception))
        throw Error('Not a Exception!.')
}

// tslint:disable-next-line: no-empty-interface
export interface ExceptionInfo {}

class ExceptionInternal extends Exception {
    public constructor() {
        super()
    }
    public type: Type = Type.OTHER
    public message!: string
    /**
     * Use to record the corresponding exception data. For example, in csfSheet
     * `info` is a hierarchy node.
     */
    public info!: ExceptionInfo
}

export class ExceptionBuilder extends Builder<Exception, ExceptionInternal> {
    public constructor(obj?: Readonly<Exception>) {
        const impl = new ExceptionInternal()
        if (obj)
            ExceptionBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    public message(message: string): this {
        this.getImpl().message = message
        return this
    }

    public info(info: ExceptionInfo): this {
        this.getImpl().info = info
        return this
    }

    protected get daa(): readonly string[] {
        return ExceptionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['message']
}

export const enum Type {
    COL_DATE,
    GITDB,
    LEXER,
    OTHER,
    PARSER,
    RENDERER,
    SEMANTIC,
    TRANSPILER,
}

export function simpleException(message: string): Exception {
    return new ExceptionBuilder().message(message).build()
}
