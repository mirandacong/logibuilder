import {
    Source,
    SourceBuilder,
    SourceImpl,
    SourceType,
    SourceValue,
} from './base'

export interface ResultSource extends Readonly<Source> {
    /**
     * Use npm package `jsonpath` to parse it.
     * Syntax see:
     *     https://www.npmjs.com/package/jsonpath#jsonpath-syntax
     */
    readonly jsonPath: string
    /**
     * The uuid of the Result.
     */
    readonly result: string
}
class ResultSourceImpl extends SourceImpl implements ResultSource {
    public get sourceType(): SourceType {
        return SourceType.RESULT
    }

    public jsonPath!: string
    public result!: string
    public value!: SourceValue
}

export class ResultSourceBuilder extends
    SourceBuilder<ResultSource, ResultSourceImpl> {
    protected get daa(): readonly string[] {
        return ResultSourceBuilder.__DAA_PROPS__
    }
    public constructor(obj?: Readonly<ResultSource>) {
        const impl = new ResultSourceImpl()
        if (obj)
            ResultSourceBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public jsonPath(jsonPath: string): this {
        this.getImpl().jsonPath = jsonPath
        return this
    }

    public result(result: string): this {
        this.getImpl().result = result
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'jsonPath',
        'result',
        'value',
    ]
}

export function isResultSource(obj: unknown): obj is ResultSource {
    return obj instanceof ResultSourceImpl
}
