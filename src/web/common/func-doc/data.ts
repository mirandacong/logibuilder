// tslint:disable
import {menuParse} from '@logi/src/web/core/logi-docsite/tools/gen_menu'

const ROOT_NODE = menuParse({'title': 'ROOT', 'group': [{'title': '多行计算函数', 'group': [{'title': 'AVERAGE', 'url': 'src/docs/func/multi/average/average.md'}, {'title': 'AVERAGEIF', 'url': 'src/docs/func/multi/averageif/averageif.md'}, {'title': 'COS', 'url': 'src/docs/func/multi/cos/cos.md'}, {'title': 'COUNT', 'url': 'src/docs/func/multi/count/count.md'}, {'title': 'DATE', 'url': 'src/docs/func/multi/date/date.md'}, {'title': 'IF', 'url': 'src/docs/func/multi/if/if.md'}, {'title': 'IFERROR', 'url': 'src/docs/func/multi/iferror/iferror.md'}, {'title': 'IRR', 'url': 'src/docs/func/multi/irr/irr.md'}, {'title': 'LOG', 'url': 'src/docs/func/multi/log/log.md'}, {'title': 'MAX', 'url': 'src/docs/func/multi/max/max.md'}, {'title': 'MIN', 'url': 'src/docs/func/multi/min/min.md'}, {'title': 'NPV', 'url': 'src/docs/func/multi/npv/npv.md'}, {'title': 'POWER', 'url': 'src/docs/func/multi/power/power.md'}, {'title': 'ROUND', 'url': 'src/docs/func/multi/round/round.md'}, {'title': 'SIN', 'url': 'src/docs/func/multi/sin/sin.md'}, {'title': 'SUM', 'url': 'src/docs/func/multi/sum/sum.md'}, {'title': 'SWITCH', 'url': 'src/docs/func/multi/switch/switch.md'}, {'title': 'XNPV', 'url': 'src/docs/func/multi/xnpv/xnpv.md'}]}, {'title': '单行计算函数', 'group': [{'title': 'average', 'url': 'src/docs/func/single/average/average.md'}, {'title': 'averageifv2', 'url': 'src/docs/func/single/averageifv2/averageifv2.md'}, {'title': 'count', 'url': 'src/docs/func/single/count/count.md'}, {'title': 'diff', 'url': 'src/docs/func/single/diff/diff.md'}, {'title': 'growth', 'url': 'src/docs/func/single/growth/growth.md'}, {'title': 'lag', 'url': 'src/docs/func/single/lag/lag.md'}, {'title': 'lead', 'url': 'src/docs/func/single/lead/lead.md'}, {'title': 'max', 'url': 'src/docs/func/single/max/max.md'}, {'title': 'min', 'url': 'src/docs/func/single/min/min.md'}, {'title': 'sum', 'url': 'src/docs/func/single/sum/sum.md'}]}]})
export const PREFIX = 'src/web/common/func-doc'

export interface FuncCategoryNode {
    readonly title: string
    readonly url?: string
    readonly group?: FuncCategoryNode[]
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getFuncList() {
    return ROOT_NODE.group as FuncCategoryNode[]
}
