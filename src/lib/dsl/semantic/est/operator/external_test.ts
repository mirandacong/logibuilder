import {Exception, isException} from '@logi/base/ts/common/exception'
import {lex, lexSuccess} from '@logi/src/lib/dsl/lexer/v2'
import {buildEst} from '@logi/src/lib/dsl/semantic'
import {Row, RowBuilder, TableBuilder} from '@logi/src/lib/hierarchy/core'

import {Node as OpInfo} from '../node'

import {isExternalOperator} from './external'

// tslint:disable-next-line: max-func-body-length
describe('external function', (): void => {
    let row: Readonly<Row>
    beforeEach((): void => {
        row = new RowBuilder().name('row').build()
        new TableBuilder().name('table').subnodes([row]).build()
    })
    it('diff', (): void => {
        const ext1 = '{abc}.diff(1)'
        const expect1 = '{abc} - {abc}.lag(1)'
        const op1 = toOpInfo(ext1)
        const expectOp = toOpInfo(expect1)
        expect(op1).toEqual(expectOp)
        const ext2 = '{a} + ({b}.diff(2))'
        const expect2 = '{a} + ({b} - {b}.lag(2))'
        expect(toOpInfo(ext2)).toEqual(toOpInfo(expect2))
    })
    it('growth', (): void => {
        const ext1 = '{a}.growth()'
        const expect1 = '{a} / {a}.lag(1) - 1'
        const op1 = toOpInfo(ext1)
        const expectOp = toOpInfo(expect1)
        expect(op1).toEqual(expectOp)
        const ext2 = '{a} + ({b}.growth())'
        const expect2 = '{a} + ({b} / {b}.lag(1) - 1)'
        expect(toOpInfo(ext2)).toEqual(toOpInfo(expect2))
    })
    it('averageifv', (): void => {
        const ext1 = 'averageifv({a}, {b})'
        const expect1 = 'sum(iferror({a}, 0), iferror({b}, 0))/count({a}, {b})'
        const op1 = toOpInfo(ext1)
        const expectOp = toOpInfo(expect1)
        expect(op1).toEqual(expectOp)
        const ext2 = 'averageifv({a}, 0)'
        const expect2 = 'sum(iferror({a}, 0), iferror(0, 0))/count({a}, 0)'
        const op2 = toOpInfo(ext2)
        const expectOp2 = toOpInfo(expect2)
        expect(op2).toEqual(expectOp2)
    })
    it('averageifv', (): void => {
        const ext1 = '{a}.averageifv()'
        const expect1 = 'iferror({a}, 0).sum() / {a}.count()'
        const op1 = toOpInfo(ext1)
        const expectOp = toOpInfo(expect1)
        expect(op1).toEqual(expectOp)
    })
    it('averageprevious', (): void => {
        const ext1 = '{a}.averageprevious(1y)'
        const expect1 = '{a}.previous(1y).average()'
        const op1 = toOpInfo(ext1)
        const expectOp = toOpInfo(expect1)
        expect(op1).toEqual(expectOp)
    })
})

type ValidateTestData = readonly [
    // expression
    string,
    // is exception
    boolean
]

describe('validate test', (): void => {
    const data: readonly ValidateTestData[] = [
        ['{a}.diff(1)', false],
        ['{a}.growth()', false],

        ['{a}.diff({b}.sum())', true],
        ['{a}.diff({b})', true],
        ['{a}.diff(1, 2)', true],
        ['{a}.growth(1)', true],
        ['{a}.growth(1, 2)', true],
        ['{a}.growth({b})', true],
        ['{a}.growth({b}.sum())', true],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code
    data.forEach((d: ValidateTestData): void => {
        it(d[0], (): void => {
            const row = new RowBuilder().name('row').build()
            new TableBuilder().name('table').subnodes([row]).build()
            const result = toOpInfo(d[0])
            expect(isException(result)).toBe(d[1])
        })
    })
})

function toOpInfo(text: string): Readonly<OpInfo> | Exception {
    const toks = lex(text)
    if (!lexSuccess(toks))
        // tslint:disable-next-line: no-throw-unless-asserts
        throw Error('Fail to lex and parse\t' + text)
    let est = buildEst(toks)
    if (isException(est))
        return est
    const validate = est.validate()
    if (validate !== undefined)
        return validate
    est = convert(est)
    deleteToken(est)
    return est
}

function deleteToken(est: Readonly<OpInfo>): void {
    // @ts-ignore
    // tslint:disable-next-line: no-delete
    delete est.token
    est.children.forEach((c: Readonly<OpInfo>): void => {
        deleteToken(c)
    })
}

function convert(est: Readonly<OpInfo>): Readonly<OpInfo> {
    if (isExternalOperator(est))
        return est.convert()
    for (let i = 0; i < est.children.length; i += 1) {
        const c = est.children[i]
        const converted = convert(c)
        // @ts-ignore
        est.children[i] = converted
        // @ts-ignore
        converted._parent = est
    }
    return est
}
