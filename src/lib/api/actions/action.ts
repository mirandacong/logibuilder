import {Payload} from '@logi/src/lib/api/payloads'
import {BaseService} from '@logi/src/lib/api/services'
import {Observable} from 'rxjs'

import {ActionType} from './type'

export interface Action {
    readonly actionType: ActionType
    getPayloads(service: BaseService):
        readonly Payload[] | Observable<readonly Payload[]>
}
