import {from, isObservable, Observable, of} from 'rxjs'

import {isPromise} from './type_guard'
export function toObservable<T>(
    value: T | Promise<T> | Observable<T>,
): Observable<T> {
    if (isObservable(value))
        return value
    if (isPromise(value))
        return from(Promise.resolve(value))
    return of(value)
}
