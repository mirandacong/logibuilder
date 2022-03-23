import {Source} from './base'
import {DatabaseSourceBuilder, isDatabaseSource} from './database'
import {isManualSource, ManualSourceBuilder} from './manual'
import {isResponseSource, ResponseSourceBuilder} from './response'
import {isResultSource, ResultSourceBuilder} from './result'

export function cloneSource(src: Source): Source | undefined {
    if (isResultSource(src))
        return new ResultSourceBuilder(src).value(src.value).build()
    if (isResponseSource(src))
        return new ResponseSourceBuilder(src).value(src.value).build()
    if (isManualSource(src))
        return new ManualSourceBuilder(src).value(src.value).build()
    if (isDatabaseSource(src))
        // @ts-ignore
        return new DatabaseSourceBuilder(src).value(src.value).build()
    return
}
