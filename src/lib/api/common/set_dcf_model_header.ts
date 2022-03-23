import {Writable} from '@logi/base/ts/common/mapped_types'
import {
    Book,
    Column,
    ColumnBlock,
    isColumn,
    isColumnBlock,
    isTable,
    Node,
    Sheet,
    Table,
} from '@logi/src/lib/hierarchy/core'
import {cloneHierarchy} from '@logi/src/lib/model'

type Header = ColumnBlock

const IGNORE_TABLES: ReadonlyArray<string> = ['企业价值', 'WACC计算表', '市值']
export function setDcfModelHeader(
    book: Readonly<Book>,
    header: Readonly<Header>,
    defaultHeader: boolean,
): void {
    const tables = getTables(book)
    tables.forEach((t: Readonly<Table>): void => {
        // tslint:disable-next-line: no-type-assertion
        const writable = t as Writable<Table>
        if (defaultHeader)
            writable.referenceHeader = header.uuid
        t.cols.forEach((c: Readonly<Column | ColumnBlock>): void => {
            t.deleteSubnode(c)
        })
        header.tree.forEach((n: Readonly<Node>): void => {
            const cloned = cloneHierarchy(n)
            if (isColumn(cloned) || isColumnBlock(cloned))
                t.insertSubnode(cloned)
        })
    })
}

function getTables(book: Readonly<Book>): readonly Readonly<Table>[] {
    const sheets = book.sheets
        .filter((s: Readonly<Sheet>): boolean => s.name !== 'data')
    const tables: Readonly<Table>[] = []
    sheets.forEach((s: Readonly<Sheet>): void => {
        s.tree.forEach((n: Readonly<Node>): void => {
            if (isTable(n) && !IGNORE_TABLES.includes(n.name))
                tables.push(n)
        })
    })
    return tables
}
