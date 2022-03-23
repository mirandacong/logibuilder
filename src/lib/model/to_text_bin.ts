// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {getPlatform, Platform} from '@logi/base/ts/common/platform'
import {readFileSync} from 'fs'

import {Model} from './base'
import {fromJson} from './from_json'
import {toText} from './to_text'

function buildBook(): Readonly<Model> {
    const jsonString = readFileSync(__dirname + '/to_text_data.json', 'utf8')
    const result = fromJson(JSON.parse(jsonString) as any)
    if (isException(result))
        // tslint:disable-next-line: no-throw-unless-asserts
        throw Error('Build book error.')
    return result
}

function main(): void {
    const result = buildBook()
    // tslint:disable-next-line: no-console
    console.log(toText(result))
}
if (getPlatform() !== Platform.NODEJS || require?.main === module)
    main()
