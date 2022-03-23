import {FormulaItem, FormulaItemBuilder} from './item'
import {preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {
    Book,
    getNodesVisitor,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'

export class Manager {
    // tslint:disable-next-line: readonly-array parameter-properties
    public constructor(public data: Readonly<FormulaItem>[] = []) {
        data.forEach((item: Readonly<FormulaItem>, idx: number): void => {
            const id = getFormulaId(item.row, item.col)
            this.map.set(id, idx)
        })
    }
    public map = new Map<string, number>()
    public getFormula(row: string, col: string): string | undefined {
        const id = getFormulaId(row, col)
        const idx = this.map.get(id)
        return idx === undefined
            ? undefined
            : this.data[idx].formula
    }

    public setFormula(row: string, col: string, formula: string): void {
        const item = new FormulaItemBuilder()
            .row(row)
            .col(col)
            .formula(formula)
            .build()
        const id = getFormulaId(row, col)
        const idx = this.map.get(id)
        if (idx !== undefined) {
            this.data[idx] = item
            return
        }
        this.data.push(item)
        this.map.set(id, this.data.length - 1)
    }

    public gc(book: Readonly<Book>): void {
        const resultMap = new Map<string, number>()
        const resultData: Readonly<FormulaItem>[] = []
        const formulas = preOrderWalk2(
            book,
            getNodesVisitor,
            [NodeType.ROW, NodeType.COLUMN],
        ).map((n: Readonly<Node>): string => n.uuid)
        this.map.forEach((value: number, key: string): void => {
            const item = this.data[value]
            if (item === undefined || item.formula === '')
                return
            if (!formulas.includes(item.row) || !formulas.includes(item.col))
                return
            resultMap.set(key, resultData.length)
            resultData.push(item)
        })
        this.map = resultMap
        this.data = resultData
        return
    }

    public encode(book: Readonly<Book>): readonly FormulaItem[] {
        this.gc(book)
        return this.data
    }
}

export function getFormulaId(row: string, col: string): string {
    return `${row}-${col}`
}
