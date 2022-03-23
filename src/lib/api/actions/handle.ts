import {
    isAddSheetPayload,
    isMoveSheetPayload,
    isRemoveSheetPayload,
    Payload,
} from '@logi/src/lib/api/payloads'
import {Plugin, ProductBuilder} from '@logi/src/lib/api/plugins'
import {BaseService} from '@logi/src/lib/api/services'
import {Observable, of, Subject} from 'rxjs'

import {Action} from './action'
import {ActionType} from './type'

export function handle(
    action: Action,
    service: BaseService,
): Observable<boolean> {
    const payloads = action.getPayloads(service)
    if (!(payloads instanceof Observable))
        return of(execute(payloads, service, action.actionType))
    const result$ = new Subject<boolean>()
    payloads.subscribe((basePayloads: readonly Payload[]): void => {
        const success = execute(basePayloads, service, action.actionType)
        result$.next(success)
        result$.complete()
    })
    return result$
}

function execute(
    payloads: readonly Payload[],
    service: BaseService,
    type: ActionType,
): boolean {
    service.lock()
    const product = new ProductBuilder()
        .actionType(type)
        .payloads(payloads)
        .build()
    // tslint:disable-next-line: unknown-instead-of-any
    service.plugins.forEach((plugin: Plugin<any>): void => {
        plugin.handle(product)
    })
    if (product.changed.length > 0)
        service.recordUndo(product.changed)
    /**
     * TODO(zecheng): Spreadsheet does not support undo/redo sheet operator but
     * hierarchy supports. At present we clear history when there are sheet
     * operators. Remove undo/redo sheet operator in hierarchy then remove the
     * code below.
     */
    const sp = payloads.find(p => isMoveSheetPayload(p) ||
        isRemoveSheetPayload(p) || isAddSheetPayload(p))
    if (sp !== undefined)
        service.clearHistory()
    service.unlock()
    /**
     * TODO(zecheng): remove the return value.
     */
    return product.payloads.length !== 0
}
