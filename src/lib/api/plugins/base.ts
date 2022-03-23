import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Notice} from '@logi/src/lib/api/notice'
import {Payload} from '@logi/src/lib/api/payloads'
import {NodeType} from '@logi/src/lib/hierarchy/core'
import {Diff, HsfBook, Status} from '@logi/src/lib/hsf'
import {Subject} from 'rxjs'

export abstract class Plugin<Message extends Result> {
    public abstract type: PluginType

    public result$!: Subject<Message>
    public notice!: Subject<Notice>
    public abstract handle(input: Readonly<Product>): void

    public setNotice(notice: Subject<Notice>): void {
        this.notice = notice
    }

    protected handlePayloads(
        input: Readonly<Product>,
        payloads = input.payloads,
    ): void {
        // tslint:disable-next-line: cyclomatic-complexity max-func-body-length
        payloads.forEach((p: Payload): void => {
            this._executePayload(p.payloadType, p, input)
        })
    }

    private _executePayload(
        funcName: string,
        p: Payload,
        input: Readonly<Product>,
    ): void {
        const func = Reflect.get(this, funcName)
        if (typeof func !== 'function')
            return
        Reflect.apply(func, this, [p, input])
    }
}

export interface Product {
    readonly payloads: readonly Payload[]
    readonly actionType: number
    readonly changed: readonly PluginType[]
    addChanged(type: PluginType): void
}

class ProductImpl implements Impl<Product> {
    public payloads: readonly Payload[] = []
    public actionType!: number
    // tslint:disable-next-line: readonly-array
    public changed: PluginType[] = []

    public addChanged(type: PluginType): void {
        this.changed.push(type)
    }
}

export class ProductBuilder extends Builder<Product, ProductImpl> {
    public constructor(obj?: Readonly<Product>) {
        const impl = new ProductImpl()
        if (obj)
            ProductBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public payloads(payloads: readonly Payload[]): this {
        this.getImpl().payloads = payloads
        return this
    }

    public actionType(type: number): this {
        this.getImpl().actionType = type
        return this
    }

    protected get daa(): readonly string[] {
        return ProductBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
    ]
}

export const enum PluginType {
    BOOK,
    DOWNLOAD,
    ERROR,
    EXPR,
    FOCUS,
    FORMULA,
    HSF,
    MODEL,
    MODIFIER,
    SHEET_TABS,
    SOURCE,
    SOURCE_PLAYGROUND,
    CLIPBOARD,
    STD_HEADER,
    WORKBOOK,
    ARIS,
    TEMPLATE,
    SAVE,
}

export interface Result {
    readonly actionType: number
}

class ResultImpl implements Impl<Result> {
    public actionType!: number
}

export class ResultBuilder extends Builder<Result, ResultImpl> {
    public constructor(obj?: Readonly<Result>) {
        const impl = new ResultImpl()
        if (obj)
            ResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    protected get daa(): readonly string[] {
        return ResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['actionType']
}

// tslint:disable-next-line: max-classes-per-file
export class ResultBaseBuilder<T extends Result, S extends Impl<T>> extends
    Builder<T, S> {
    protected get daa(): readonly string[] {
        return ResultBaseBuilder.__DAA_PROPS__
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['actionType']
}

export function isResult(value: unknown): value is Result {
    return value instanceof ResultImpl
}

export function assertIsResult(value: unknown): asserts value is Result {
    if (!(value instanceof ResultImpl))
        throw Error('Not a Result!')
}

export interface RemovedInfo {
    readonly sheetName: string
    /**
     * The type of this removed node.
     */
    readonly type: NodeType
    /**
     * Used in hsf increment. The node uuid of the node that is 'responsible'
     * for this removed node. For example, a table node is removed and its
     * responsible node should be its parent(sheet node). In this situation,
     * the hsf->excel increment would repaint this sheet.
     * Notice that we do NOT use uuid to defined a sheet. We use sheet name to
     * describe a sheet. In an other way, if the responsible node is a sheet,
     * this property should be the name of this sheet.
     *
     * Ask yiliang for details.
     */
    readonly responsible: string
    /**
     * The index of the removed node in the responsible parent.
     */
    readonly index: number
    /**
     * The related fbs that is removed because of this removed node.
     */
    readonly fbs: readonly string[]
}

// tslint:disable: max-classes-per-file
class RemovedInfoImpl implements Impl<RemovedInfo> {
    public sheetName!: string
    public type!: NodeType
    public responsible!: string
    public index!: number
    public fbs: readonly string[] = []
}

export class RemovedInfoBuilder extends Builder<RemovedInfo, RemovedInfoImpl> {
    public constructor(obj?: Readonly<RemovedInfo>) {
        const impl = new RemovedInfoImpl()
        if (obj)
            RemovedInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public type(type: NodeType): this {
        this.getImpl().type = type
        return this
    }

    public sheetName(sheetName: string): this {
        this.getImpl().sheetName = sheetName
        return this
    }

    public responsible(responsible: string): this {
        this.getImpl().responsible = responsible
        return this
    }

    public index(index: number): this {
        this.getImpl().index = index
        return this
    }

    public fbs(fbs: readonly string[]): this {
        this.getImpl().fbs = fbs
        return this
    }

    protected get daa(): readonly string[] {
        return RemovedInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['type', 'responsible']
}

export interface HsfInfo {
    readonly hsfBook: HsfBook
    readonly status: Status
    readonly hsfDiff?: Diff
}

class HsfInfoImpl implements Impl<HsfInfo> {
    public hsfBook!: HsfBook
    public status!: Status
    public hsfDiff?: Diff
}

export class HsfInfoBuilder extends Builder<HsfInfo, HsfInfoImpl> {
    public constructor(obj?: Readonly<HsfInfo>) {
        const impl = new HsfInfoImpl()
        if (obj)
            HsfInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public hsfBook(hsfBook: HsfBook): this {
        this.getImpl().hsfBook = hsfBook
        return this
    }

    public status(status: Status): this {
        this.getImpl().status = status
        return this
    }

    public hsfDiff(hsfDiff: Diff): this {
        this.getImpl().hsfDiff = hsfDiff
        return this
    }

    protected get daa(): readonly string[] {
        return HsfInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'hsfBook',
        'status',
    ]
}

export function isHsfInfo(value: unknown): value is HsfInfo {
    return value instanceof HsfInfoImpl
}

export function assertIsHsfInfo(value: unknown): asserts value is HsfInfo {
    if (!(value instanceof HsfInfoImpl))
        throw Error('Not a HsfInfo!')
}

// tslint:disable-next-line: max-file-line-count
