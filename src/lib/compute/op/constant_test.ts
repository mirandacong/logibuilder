// tslint:disable: no-magic-numbers
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {ConstantOpBuilder} from './constant'

describe('Constant test', () => {
    it('Name test', () => {
        const c1 = new ConstantOpBuilder().outType(t.number).value(3).build()
        expect(c1.name).toBe('CONSTANT')
        const c2 = new ConstantOpBuilder().outType(t.number).value(3).build()
        expect(c2.name).toBe('CONSTANT')
    })
    it('Build test', () => {
        const c = new ConstantOpBuilder()
            .name('constant_0')
            .outType(t.number)
            .value(3)
            .build()
        expect(c.evaluate()).toBe(3)
        expect(c.excelFormula()).toBe('3')
    })
    it('Build without name, expect tobe successful', () => {
        const builder = new ConstantOpBuilder().outType(t.number).value(3)
        expect(builder.build().evaluate()).toBe(3)
    })
    it('Build without outType, expect to throw error', () => {
        const builder = new ConstantOpBuilder().name('constant_0').value(3)
        expect(() => builder.build()).toThrow()
    })
    it('Build without value, expect to throw error', () => {
        const builder =
            new ConstantOpBuilder().name('constant_0').outType(t.number)
        expect(() => builder.build()).toThrow()
    })
})
