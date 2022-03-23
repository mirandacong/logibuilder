import {isException} from '@logi/base/ts/common/exception'
import {fromJson, Model} from '@logi/src/lib/model'
import {readFileSync} from 'fs'

export const enum TestBook {
    LOGI1 = 1,
    LOGI2 = 2,
    LOGI3 = 3,
    LOGI4 = 4,
    LOGI5 = 5,
    LOGI6 = 6,
    LOGI7 = 7,
    LOGI8 = 8,
}

export function buildTestModel(): Readonly<Model> {
    return buildModel(TestBook.LOGI1)
}

export function buildTestModel2(): Readonly<Model> {
    return buildModel(TestBook.LOGI2)
}

export function buildTestModel3(): Readonly<Model> {
    return buildModel(TestBook.LOGI3)
}

export function buildTestModel4(): Readonly<Model> {
    return buildModel(TestBook.LOGI4)
}

export function buildTestModel5(): Readonly<Model> {
    return buildModel(TestBook.LOGI5)
}

export function buildTestModel6(): Readonly<Model> {
    return buildModel(TestBook.LOGI6)
}

export function buildTestModel7(): Readonly<Model> {
    return buildModel(TestBook.LOGI7)
}

export function buildTestModel8(): Readonly<Model> {
    return buildModel(TestBook.LOGI8)
}

function buildModel(testBook: TestBook): Readonly<Model> {
    const str = readFileSync(
        __dirname +
        `/${testBook}/book.json`,
        'utf-8',
    )
    const result = fromJson(JSON.parse(str) as any)
    if (isException(result))
        /**
         * Throw error only in test.
         */
        // tslint:disable-next-line: no-throw-unless-asserts
        throw Error('json to book error, ' + result.message)

    return result
}
