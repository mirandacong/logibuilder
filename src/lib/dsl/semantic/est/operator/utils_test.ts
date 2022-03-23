// tslint:disable: no-magic-numbers
import {Op, OP_REGISTRY, SubOpInfo} from '@logi/src/lib/compute/op'
import {
    Column,
    ColumnBuilder,
    Row,
    RowBuilder,
} from '@logi/src/lib/hierarchy/core'

import {CellCoordinate, Head, HEADLESS, Headless, OpAndInNodes} from '../node'

import {equals, getOp, intersect, isIncluded, toSubOpInfos} from './utils'

/**
 * [0]: opname
 * [1]: input args
 * [2]: output excel formula
 */
type OpTestData = readonly [string, readonly string[], string]

describe('get op test', (): void => {
    const data: readonly OpTestData[] = [
        ['AVERAGE', ['a', 'b'], 'average(a,b)'],
        ['average', ['a', 'b'], 'average(a,b)'],
        ['Average', ['a', 'b'], 'average(a,b)'],
        ['AveRage', ['a', 'b'], 'average(a,b)'],
        ['+', ['a', 'b'], 'a+b'],
        ['add', ['a', 'b'], 'a+b'],
        ['Add', ['a', 'b'], 'a+b'],
        ['AdD', ['a', 'b'], 'a+b'],
        ['-', ['a', 'b'], 'a-b'],
        ['*', ['a', 'b'], 'a*b'],
        ['/', ['a', 'b'], 'a/b'],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code
    data.forEach((d: OpTestData): void => {
        it(d[0], (): void => {
            const name = d[0]
            const op = getOp(name)
            expect(op.excelFormula(...d[1])).toBe(d[2])
        })
    })
})

type SubOpInfoTestData = readonly [
    readonly OpAndInNodes[], readonly SubOpInfo[]]

// tslint:disable-next-line: max-func-body-length
describe('toSubOpInfo test', (): void => {
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let row3: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    let add: Op
    let min: Op
    let data: SubOpInfoTestData[]
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row2').build()
        row3 = new RowBuilder().name('row3').build()
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        col3 = new ColumnBuilder().name('col3').build()
        const addStr = 'add'
        const minStr = 'min'
        add = OP_REGISTRY.get(addStr) as Op
        min = OP_REGISTRY.get(minStr) as Op
        data = [
            [
                [
                    [add, [[row1, col1], [row1, col2], [row1, col3]]],
                    [min, [[row2, col1], [row2, col2], [row2, col3]]],
                ],
                [
                    [add, [0, 1, 2]],
                    [min, [3, 4, 5]],
                ],
            ],
            [
                [
                    [add, [[row1, col1], [row1, col2], [row1, col3]]],
                    [min, [[row1, col1], [row1, col2], [row1, col3]]],
                ],
                [
                    [add, [0, 1, 2]],
                    [min, [0, 1, 2]],
                ],
            ],
            [
                [
                    [undefined, [[row3, col3]]],
                ],
                [
                    0,
                ],
            ],
        ]
    })
    it('test toSubOpInfo', (): void => {
        data.forEach((d: SubOpInfoTestData): void => {
            const opAndInNodes = d[0]
            const subOpInfos = d[1]
            expect(toSubOpInfos(opAndInNodes)).toEqual(subOpInfos)
        })
    })
})

type IntersectTestData = readonly [
    readonly (Head | Headless)[],
    readonly (Head | Headless)[],
    readonly (Head | Headless)[],
]

// tslint:disable-next-line: max-func-body-length
describe('intersect test', (): void => {
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    let data: IntersectTestData[]
    beforeEach((): void => {
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        col3 = new ColumnBuilder().name('col3').build()
        data = [
            [
                [
                    col1, col2,
                ],
                [
                    col2, col3,
                ],
                [
                    col2,
                ],
            ],
            [
                [],
                [
                    col1,
                ],
                [],
            ],
            [
                [
                    col1, col2,
                ],
                [
                    HEADLESS,
                ],
                [
                    col1, col2,
                ],
            ],
        ]
    })
    it('test toSubOpInfo', (): void => {
        data.forEach((d: IntersectTestData): void => {
            const cols0 = d[0]
            const cols1 = d[1]
            const output = d[2]
            expect(intersect(cols0, cols1)).toEqual(output)
        })
    })
})

type IsIncludedTestData =
    readonly [readonly CellCoordinate[], CellCoordinate, boolean]

// tslint:disable-next-line: max-func-body-length
describe('intersect test', (): void => {
    let row1: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    let data: IsIncludedTestData[]
    beforeEach((): void => {
        row1 = new RowBuilder().name('row1').build()
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        col3 = new ColumnBuilder().name('col3').build()
        data = [
            [
                [
                    [row1, col1], [row1, col2],
                ],
                [row1, col1],
                true,
            ],
            [
                [
                    [row1, col1], [row1, col2],
                ],
                [row1, col3],
                false,
            ],
        ]
    })
    it('test isIncluded', (): void => {
        data.forEach((d: IsIncludedTestData): void => {
            const arr = d[0]
            const item = d[1]
            expect(isIncluded(arr, item)).toBe(d[2])
        })
    })
})

type EqualsTestData = readonly [Head, Head, boolean]

describe('intersect test', (): void => {
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let data: EqualsTestData[]
    beforeEach((): void => {
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row1').build()
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        data = [
            [row1, col1, false],
            [row1, row1, true],
            [row1, col2, false],
            [row1, row2, false],
        ]
    })
    it('test isIncluded', (): void => {
        data.forEach((d: EqualsTestData): void => {
            const item1 = d[0]
            const item2 = d[1]
            expect(equals(item1, item2)).toBe(d[2])
        })
    })
})
