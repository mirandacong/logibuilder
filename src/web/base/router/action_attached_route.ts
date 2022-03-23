import type {TemplateRef} from '@angular/core'

/**
 * 在切换每个子路由组件时，导航栏的最右边可能会显示与该子路由组件相关的操作按钮
 * 那么这个路由组件是一个 ActionAttachedRoute
 */
export interface ActionAttachedRoute {
    /**
     * 操作按钮模板
     */
    readonly navActionTpl: TemplateRef<unknown>
}
