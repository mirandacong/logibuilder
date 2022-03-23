import {Observable} from 'rxjs'

import {SimpleEditorComponent} from './component'

/**
 * @testonly
 */
export const enum ObservableName {
    EDITOR_EVENT = '_editorEvent$',
    RESPONSE = '_response$',
    EXPRESSION_PAYLOAD = '_expressionPayload$',
    EXPRESSION_RESP = '_expressionResp$',
    DESTROYED = '_destroyed$',
}

/**
 * @testonly
 */
export function $getObservable<T>(
    component: SimpleEditorComponent,
    name: ObservableName,
): Observable<T> {
    return Reflect.get(component, name)
}

/**
 * @testonly
 */
export function $setObservable(
    component: SimpleEditorComponent,
    name: ObservableName,
    value: Observable<unknown>,
): void {
    Reflect.set(component, name, value)
}
