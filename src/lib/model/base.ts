import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {FormulaManager} from '@logi/src/lib/formula'
import {Book} from '@logi/src/lib/hierarchy/core'
import {ModifierManager} from '@logi/src/lib/modifier'
import {SourceManager} from '@logi/src/lib/source'
import {TemplateSet, TemplateSetBuilder} from '@logi/src/lib/template'

export interface Model {
    readonly book: Readonly<Book>
    readonly sourceManager: SourceManager
    readonly formulaManager: FormulaManager
    readonly modifierManager: ModifierManager
    readonly stdHeaderSet: TemplateSet
}

class ModelImpl implements Impl<Model> {
    public book!: Readonly<Book>
    public sourceManager = new SourceManager([])
    public formulaManager = new FormulaManager([])
    public modifierManager = new ModifierManager([])
    public stdHeaderSet = new TemplateSetBuilder().build()
}

export class ModelBuilder extends Builder<Model, ModelImpl> {
    public constructor(obj?: Readonly<Model>) {
        const impl = new ModelImpl()
        if (obj)
            ModelBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public book(book: Readonly<Book>): this {
        this.getImpl().book = book
        return this
    }

    public sourceManager(sourceManager: SourceManager): this {
        this.getImpl().sourceManager = sourceManager
        return this
    }

    public formulaManager(formulaManager: FormulaManager): this {
        this.getImpl().formulaManager = formulaManager
        return this
    }

    public modifierManager(modifierManager: ModifierManager): this {
        this.getImpl().modifierManager = modifierManager
        return this
    }

    public stdHeaderSet(stdHeaderSet: TemplateSet): this {
        this.getImpl().stdHeaderSet = stdHeaderSet
        return this
    }

    protected get daa(): readonly string[] {
        return ModelBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['sourceManager', 'book']
}

export function isModel(value: unknown): value is Model {
    return value instanceof ModelImpl
}

export function assertIsModel(value: unknown): asserts value is Model {
    if (!(value instanceof ModelImpl))
        throw Error('Not a Model!')
}
