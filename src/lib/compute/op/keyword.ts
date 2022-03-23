import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
/**
 * Keyword is one type of constant.
 * We use this enum to manage keyword constant more conveniently and learn about
 * each keyword quickly.
 */
// tslint:disable-next-line: const-enum
export enum KeyWord {
    /**
     * Represent the null value.
     * For example, IFFERROR(a/b, NULL), {ref}.lag(NULL)
     * And it will convert to empty string "" in excel formula.
     */
    NULL = 'NULL',
    /**
     * Only be used in est, represent the empty parameters.
     * For example, power(,1) will get power(NONE, 1) when converting to est.
     * NONE constant also will make est validate failed.
     */
    NONE = 'NONE',
}

export function isKeyWord(key: unknown): key is KeyWord {
    if (typeof key !== 'string')
        return false
    // tslint:disable-next-line: no-object
    return Object
        .keys(KeyWord)
        .map((k: string): string => Reflect.get(KeyWord, k))
        .includes(key)
}

export function getAllKeyWords(): readonly KeywordFeature[] {
    const nullKeyword = new KeywordFeatureBuilder()
        .image(KeyWord.NULL)
        .isInternal(false)
        .build()
    const noneKeyword = new KeywordFeatureBuilder()
        .image(KeyWord.NONE)
        .isInternal(true)
        .build()
    return [
        nullKeyword,
        noneKeyword,
    ]
}

export interface KeywordFeature {
    readonly image: KeyWord
    readonly description: string
    /**
     * Whether this keyword is only used for lexer and parser and is not exposed
     * to user.
     */
    readonly isInternal: boolean
}

class KeywordFeatureImpl implements Impl<KeywordFeature> {
    public image!: KeyWord
    public description = ''
    public isInternal!: boolean
}

export class KeywordFeatureBuilder
    extends Builder<KeywordFeature, KeywordFeatureImpl> {
    public constructor(obj?: Readonly<KeywordFeature>) {
        const impl = new KeywordFeatureImpl()
        if (obj)
            KeywordFeatureBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public image(image: KeyWord): this {
        this.getImpl().image = image
        return this
    }

    public description(description: string): this {
        this.getImpl().description = description
        return this
    }

    public isInternal(isInternal: boolean): this {
        this.getImpl().isInternal = isInternal
        return this
    }

    protected get daa(): readonly string[] {
        return KeywordFeatureBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'image',
        'description',
        'isInternal',
    ]
}

export function isKeywordFeature(value: unknown): value is KeywordFeature {
    return value instanceof KeywordFeatureImpl
}

export function assertIsKeywordFeature(
    value: unknown,
): asserts value is KeywordFeature {
    if (!(value instanceof KeywordFeatureImpl))
        throw Error('Not a KeywordFeature!')
}
