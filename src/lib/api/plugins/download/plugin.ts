import {debugTimer} from '@logi/base/ts/common/debug'
import {isException} from '@logi/base/ts/common/exception'
import {FileType} from '@logi/base/ts/common/file_type'
import {DownloadPayload} from '@logi/src/lib/api/payloads'
import {ModifierPlugin} from '@logi/src/lib/api/plugins/modifier'
import {forkJoin, of, Subject} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {Plugin as BookPlugin} from '../book/plugin'
import {FileResult, FileResultBuilder} from '../file_result'
import {FormBuilder} from '../form'
import {Plugin as FormulaPlugin} from '../formula/plugin'
import {Plugin as HsfPlugin} from '../hsf/plugin'
import {Plugin as SourcePlugin} from '../source/plugin'
import {Plugin as StdHeaderPlugin} from '../std_header/plugin'
import {Plugin as WorkbookPlugin} from '../workbook/plugin'

import {Data, DataBuilder} from './defs'
import {download} from './lib'

export class Plugin extends Base<FileResult> {
    // tslint:disable-next-line: max-func-body-length
    public constructor(
        private readonly _book: BookPlugin,
        private readonly _tmpl: StdHeaderPlugin,
        private readonly _src: SourcePlugin,
        private readonly _formula: FormulaPlugin,
        private readonly _modifier: ModifierPlugin,
        private readonly _hsf: HsfPlugin,
        private readonly _workbook: WorkbookPlugin,
    ) {
        super()
        this._data = new DataBuilder()
            .book(this._book)
            .src(this._src)
            .formula(this._formula)
            .hsf(this._hsf)
            .modifier(this._modifier)
            .workbook(this._workbook)
            .tmpl(this._tmpl)
            .build()
    }
    public type = PluginType.DOWNLOAD
    public result$ = new Subject<FileResult>()
    @debugTimer('download plugin')
    public handle(input: Readonly<Product>): void {
        this.handlePayloads(input)
    }

    // tslint:disable-next-line: max-func-body-length
    public downloadPayload(p: DownloadPayload, input: Readonly<Product>): void {
        const logi = p.logi ? download(this._data, FileType.LOGI, p) : of(
            undefined,
        )
        const excel = p.excel
            ? download(this._data, FileType.XLSX, p)
            : of(undefined)
        const zip = p.zip ? download(this._data, FileType.ZIP, p) : of(
            undefined,
        )
        const txt = p.txt ? download(this._data, FileType.TXT, p) : of(
            undefined,
        )
        forkJoin(logi, excel, zip, txt).subscribe((res): void => {
            // tslint:disable-next-line: no-try
            try {
                const logiBin = res[0]
                if (isException(logiBin)) {
                    this.result$.error(logiBin)
                    return
                }
                const excelBin = res[1]
                if (isException(excelBin)) {
                    this.result$.error(excelBin)
                    return
                }
                // tslint:disable-next-line: no-magic-numbers
                const zipBin = res[2]
                if (isException(zipBin)) {
                    this.result$.error(zipBin)
                    return
                }
                // tslint:disable-next-line: no-magic-numbers
                const txtBin = res[3]
                if (isException(txtBin)) {
                    this.result$.error(txtBin)
                    return
                }
                const result = new FileResultBuilder()
                    .actionType(input.actionType)
                    .logi(logiBin)
                    .excel(excelBin)
                    .zip(zipBin)
                    .txt(txtBin)
                    .build()
                this.result$.next(result)
            } catch (e) {
                this.result$.error(e)
            }
        })
    }

    private _data!: Data
}

export const DOWNLOAD_FORM = new FormBuilder()
    .type(PluginType.DOWNLOAD)
    .deps([
        PluginType.BOOK,
        PluginType.STD_HEADER,
        PluginType.SOURCE,
        PluginType.FORMULA,
        PluginType.MODIFIER,
        PluginType.HSF,
        PluginType.WORKBOOK])
    .ctor(Plugin)
    .build()
