import {ColumnBlock} from '@logi/src/lib/hierarchy/core'
import {buildStdHeader, HeaderInfo, ReportDate} from '@logi/src/lib/template'

type Header = ColumnBlock

export function buildDcfHeader(
    reportDate: ReportDate,
    infos: readonly HeaderInfo[],
): Readonly<Header> {
    return buildStdHeader(reportDate, infos)
}
