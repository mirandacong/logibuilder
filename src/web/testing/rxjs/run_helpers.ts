import {TestScheduler} from 'rxjs/testing'

/**
 * The `RunHelpers` interface is not exported from 'rxjs/testing' but will be
 * used for type declaration in `test.spec.ts`. So copy the definition here.
 */
export interface RunHelpers {
    readonly cold: typeof TestScheduler.prototype.createColdObservable
    readonly hot: typeof TestScheduler.prototype.createHotObservable
    readonly flush: typeof TestScheduler.prototype.flush
    readonly expectObservable: typeof TestScheduler.prototype.expectObservable
    readonly expectSubscriptions:
        typeof TestScheduler.prototype.expectSubscriptions
}
