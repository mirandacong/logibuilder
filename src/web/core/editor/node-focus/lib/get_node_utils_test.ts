// tslint:disable: no-magic-numbers
import {
    ColumnBuilder,
    RowBuilder,
    SliceExprBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    FocusType,
    NodeFocusInfoBuilder,
} from '@logi/src/web/core/editor/node-focus/define'

import {getFocusInfosUnderTable} from './get_node_utils'

// tslint:disable-next-line: max-func-body-length
describe('get node utils test', () => {
    it('getFlatFocusFbAndSlices test', () => {
        const slice1 = new SliceExprBuilder().name('slice1').build()
        const fb1 = new RowBuilder().name('row1').sliceExprs([slice1]).build()
        const slice2 = new SliceExprBuilder().name('slice2').build()
        const fb2 = new ColumnBuilder()
            .name('col1')
            .sliceExprs([slice2])
            .build()
        const fb3 = new RowBuilder().name('fb3').build()
        new TableBuilder().name('').subnodes([fb1, fb2, fb3]).build()
        const infos = getFocusInfosUnderTable(fb1)
        const expectedInfos = [
            new NodeFocusInfoBuilder()
                .nodeId(fb1.uuid)
                .focusType(FocusType.NAME)
                .build(),
            new NodeFocusInfoBuilder()
                .nodeId(fb1.uuid)
                .slice(slice1)
                .focusType(FocusType.EXPRESSION)
                .build(),
            new NodeFocusInfoBuilder()
                .nodeId(fb3.uuid)
                .focusType(FocusType.NAME)
                .build(),
            new NodeFocusInfoBuilder()
                .nodeId(fb3.uuid)
                .focusType(FocusType.EXPRESSION)
                .build(),
        ]
        expect(infos.length).toBe(expectedInfos.length)
        infos.forEach((info, i) => {
            expect(info.infoEqual(expectedInfos[i])).toBe(true)
        })
    })
})
