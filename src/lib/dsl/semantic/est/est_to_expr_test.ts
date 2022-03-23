import {Exception, ExceptionBuilder} from '@logi/base/ts/common/exception'
import {lex, lexSuccess} from '@logi/src/lib/dsl/lexer/v2'
import {assertIsEst, Node as Est} from '@logi/src/lib/dsl/semantic/est'

import {buildEst} from './build_est'
import {estToExpr} from './est_to_expr'

// tslint:disable-next-line: max-func-body-length
describe('est to expr test', (): void => {
    it('op', (): void => {
        const expr = '1 + 2'
        const est = getEst(expr)
        assertIsEst(est)
        const expr2 = estToExpr(est)
        expect(expr2).toBe(expr)
    })
    it('reference', (): void => {
        const expr = '{Sheet!Table!Row}'
        const est = getEst(expr)
        assertIsEst(est)
        const expr2 = estToExpr(est)
        expect(expr2).toBe(expr)
    })
    it('constant', (): void => {
        const expr = '5'
        const est = getEst(expr)
        assertIsEst(est)
        const expr2 = estToExpr(est)
        expect(expr2).toBe(expr)
        const date = '1Y'
        const est2 = getEst(date)
        assertIsEst(est2)
        const date2 = estToExpr(est2)
        expect(date2).toBe(date)
    })
    it('slice', (): void => {
        const expr = '{ref}[slice]'
        const est = getEst(expr)
        assertIsEst(est)
        const expr2 = estToExpr(est)
        expect(expr2).toBe(expr)
    })
    it('ops', (): void => {
        const expr = '1 * (2 + 3)'
        const est = getEst(expr)
        assertIsEst(est)
        const expr2 = estToExpr(est)
        expect(expr2).toBe(expr)
    })
    it('method', (): void => {
        const expr = '{a}.lag(1Y)'
        const est = getEst(expr)
        assertIsEst(est)
        const expr2 = estToExpr(est)
        expect(expr2).toBe(expr)
    })
    it('func', (): void => {
        const expr = 'sum({row1}::{row10}, 10)'
        const est = getEst(expr)
        assertIsEst(est)
        const expr2 = estToExpr(est)
        expect(expr2).toBe(expr)
    })
    it('unary', (): void => {
        const expr = '-5 + 3'
        const est = getEst(expr)
        assertIsEst(est)
        const expr2 = estToExpr(est)
        expect(expr2).toBe(expr)
    })
})

function getEst(expr: string): Readonly<Est> | Exception {
    const tokens = lex(expr)
    if (!lexSuccess(tokens))
        return new ExceptionBuilder().message('lex error').build()
    return buildEst(tokens)
}
