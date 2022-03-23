import {
    Source,
    SourceBuilder,
    SourceImpl,
    SourceType,
    SourceValue,
} from './base'

export interface ResponseSource extends Readonly<Source> {
    /**
     * Use npm package `jsonpath` to parser it.
     * Syntax see:
     *     https://www.npmjs.com/package/jsonpath#jsonpath-syntax
     */
    readonly jsonPath: string
    /**
     * The uuid of the Response.
     */
    readonly response: string
}

class ResponseSourceImpl extends SourceImpl implements ResponseSource {
    public get sourceType(): SourceType {
        return SourceType.RESPONSE
    }

    public jsonPath!: string
    public response!: string

    public value!: SourceValue
}

export class ResponseSourceBuilder extends
    SourceBuilder<ResponseSource, ResponseSourceImpl> {
    protected get daa(): readonly string[] {
        return ResponseSourceBuilder.__DAA_PROPS__
    }
    public constructor(obj?: Readonly<ResponseSource>) {
        const impl = new ResponseSourceImpl()
        if (obj)
            ResponseSourceBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public jsonPath(jsonPath: string): this {
        this.getImpl().jsonPath = jsonPath
        return this
    }

    public response(response: string): this {
        this.getImpl().response = response
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'jsonPath',
        'response',
        'value',
    ]
}

export function isResponseSource(obj: unknown): obj is ResponseSource {
    return obj instanceof ResponseSourceImpl
}
