import {Exception, isException} from '@logi/base/ts/common/exception'
import {getLogger} from '@logi/base/ts/common/log'
import {
    buildTestModel,
    buildTestModel2,
    buildTestModel3,
    buildTestModel4,
    buildTestModel5,
    buildTestModel6,
    buildTestModel7,
    buildTestModel8,
} from '@logi/src/lib/dsl/logi_test_data'
import {Model} from '@logi/src/lib/model'
import {writeFileSync} from 'fs'

import {ExprManager} from '../expr_manager'

import {getTestStr} from './test_utils'

const EXPR_SUFFIX = '.expr.yaml.golden'

function convert(model: Readonly<Model>): ExprManager | Exception {
    const logger = getLogger()
    logger.debug('start semantic')
    const manager = new ExprManager()
    manager.convert(model.book)
    return manager
}

const BOOKS: readonly (readonly [Readonly<Model>, string])[] = [
    [buildTestModel(), 'logi'],
    [buildTestModel2(), 'logi2'],
    [buildTestModel3(), 'logi3'],
    [buildTestModel4(), 'logi4'],
    [buildTestModel5(), 'logi5'],
    [buildTestModel6(), 'logi6'],
    [buildTestModel7(), 'logi7'],
    [buildTestModel8(), 'logi8'],
]

BOOKS.forEach((pair: readonly [Readonly<Model>, string]): void => {
    genExprData(pair[0], pair[1])
},
)

function genExprData(model: Readonly<Model>, name: string): void {
    const manager = convert(model)
    if (isException(manager))
        return
    const content = getTestStr(model.book, manager)
    write(name + EXPR_SUFFIX, content)

    return
}

function write(fileName: string, content: string): void {
    writeFileSync(fileName, content)
}
