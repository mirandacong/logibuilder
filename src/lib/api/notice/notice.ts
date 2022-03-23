import {Message} from './message'

export interface Notice {
    readonly actionType: number
    getMessage(): Message
}
