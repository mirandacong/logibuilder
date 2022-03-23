import {TemplateRef} from '@angular/core'
import {SafeAny} from '@logi/src/web/ui/core'

export type SelectMode = 'default' | 'multiple'

export interface OptionPayload {
    readonly template?: TemplateRef<SafeAny>
    readonly label: string | null
    readonly value: SafeAny
    readonly key: SafeAny
    readonly hide?: boolean
    readonly disabled?: boolean
    readonly groupLabel?: string | TemplateRef<SafeAny> | null
    readonly type?: 'item' | 'group'
}
export type SelectedOptionPayload = Partial<OptionPayload> & {
    readonly isExceedTag?: boolean,
}
