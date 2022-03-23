import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface View {
    readonly frozen?: Frozen
    readonly gridline?: Gridline
}

class ViewImpl implements Impl<View> {
    public frozen?: Frozen
    public gridline?: Gridline
}

export class ViewBuilder extends Builder<View, ViewImpl> {
    public constructor(obj?: Readonly<View>) {
        const impl = new ViewImpl()
        if (obj)
            ViewBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public frozen(frozen: Frozen): this {
        this.getImpl().frozen = frozen
        return this
    }

    public gridline(gridline: Gridline): this {
        this.getImpl().gridline = gridline
        return this
    }
}

export interface Frozen {
    /**
     * The number of rows to freeze.
     * You can get more information from the website below:
     *    https://help.grapecity.com/spread/SpreadSheets12/webframe.html#SpreadJS~GC.Spread.Sheets.Worksheet~frozenRowCount.html
     */
    readonly rowCount: number
    /**
     * The number of columns to freeze.
     * You can get more information from the website below:
     *    https://help.grapecity.com/spread/SpreadSheets12/webframe.html#SpreadJS~GC.Spread.Sheets.Worksheet~frozenColumnCount.html
     */
    readonly columnCount: number

}

class FrozenImpl implements Impl<Frozen> {
    public rowCount = 0
    public columnCount = 0
}

export class FrozenBuilder extends Builder<Frozen, FrozenImpl> {
    public constructor(obj?: Readonly<Frozen>) {
        const impl = new FrozenImpl()
        if (obj)
            FrozenBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public rowCount(rowCount: number): this {
        this.getImpl().rowCount = rowCount
        return this
    }

    public columnCount(columnCount: number): this {
        this.getImpl().columnCount = columnCount
        return this
    }
}

export interface Gridline {
    /**
     * The option to show horizontal gridline.
     * You can get more information from the website below:
     *    https://help.grapecity.com/spread/SpreadSheets12/webframe.html#SpreadJS~GC.Spread.Sheets.Worksheet~options.html
     */
    readonly horizontal: boolean
    /**
     * The option to show vertical gridline.
     * You can get more information from the website below:
     *    https://help.grapecity.com/spread/SpreadSheets12/webframe.html#SpreadJS~GC.Spread.Sheets.Worksheet~options.html
     */
    readonly vertical: boolean
}

class GridlineImpl implements Impl<Gridline> {
    public horizontal = false
    public vertical = false
}

// tslint:disable-next-line: max-classes-per-file
export class GridlineBuilder extends Builder<Gridline, GridlineImpl> {
    public constructor(obj?: Readonly<Gridline>) {
        const impl = new GridlineImpl()
        if (obj)
            GridlineBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public horizontal(horizontal: boolean): this {
        this.getImpl().horizontal = horizontal
        return this
    }

    public vertical(vertical: boolean): this {
        this.getImpl().vertical = vertical
        return this
    }
}
