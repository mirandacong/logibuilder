import {Builder} from '@logi/base/ts/common/builder'

export function getReplacedBooks(): readonly Readonly<BuiltinModel>[] {
    return TEST_DATA
}

/**
 * Use it in `getReplacedBooks`.
 */
export interface BuiltinModel {
    readonly path: string
    readonly name: string
}

class BuiltinModelImpl implements BuiltinModel {
    public path!: string
    public name!: string
}

class BuiltinModelBuilder extends Builder<BuiltinModel, BuiltinModelImpl> {
    public constructor(obj?: Readonly<BuiltinModel>) {
        const impl = new BuiltinModelImpl()
        if (obj)
            BuiltinModelBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public path(path: string): this {
        this.getImpl().path = path
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return BuiltinModelBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['name', 'path']
}

const TEST_DATA: readonly BuiltinModel[] = [
    new BuiltinModelBuilder()
        .name('logi1-Test model')
        .path(src/lib/dsl/logi_test_data/1/book.json').build(),
    new BuiltinModelBuilder()
        .name('logi2-FS')
        .path(src/lib/dsl/logi_test_data/2/book.json').build(),
    new BuiltinModelBuilder()
        .name('logi3-Test model')
        .path(src/lib/dsl/logi_test_data/3/book.json').build(),
    new BuiltinModelBuilder()
        .name('logi4-Test model')
        .path(src/lib/dsl/logi_test_data/4/book.json').build(),
    new BuiltinModelBuilder()
        .name('logi5-阿里健康 00241.HK')
        .path(src/lib/dsl/logi_test_data/5/book.json').build(),
    new BuiltinModelBuilder()
        .name('logi6-Style template')
        .path(src/lib/dsl/logi_test_data/6/book.json').build(),
    new BuiltinModelBuilder()
        .name('logi7-DCF Model')
        .path(src/lib/dsl/logi_test_data/7/book.json').build(),
    new BuiltinModelBuilder()
        .name('logi8-basic_dcf')
        .path(src/lib/dsl/logi_test_data/8/book.json').build(),
]
