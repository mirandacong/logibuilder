// tslint:disable-next-line: no-wildcard-import
import * as excel from '@grapecity/spread-excelio'
// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {strToUint8Array} from '@logi/base/ts/common/buffer'
import {
    Exception,
    ExceptionBuilder,
    isException,
} from '@logi/base/ts/common/exception'
import {FileType} from '@logi/base/ts/common/file_type'
import {DownloadPayload} from '@logi/src/lib/api/payloads'
import {CoverData, getDownloadExcel} from '@logi/src/lib/hsf'
import {Model, ModelBuilder, toJson, toText} from '@logi/src/lib/model'
import JSZip from 'jszip'
import {forkJoin, from, Observable, of, Subscriber} from 'rxjs'

import {Data} from './defs'

/**
 * The download handler.
 */
export function download(
    // tslint:disable-next-line: max-params
    product: Data,
    type: FileType,
    payload: DownloadPayload,
): Observable<Readonly<Uint8Array> | Exception> {
    const data = payload.data
    const model = new ModelBuilder()
        .book(product.book.book)
        .sourceManager(product.src.sourceManager)
        .formulaManager(product.formula.formulaManager)
        .modifierManager(product.modifier.modifierManager)
        .stdHeaderSet(product.tmpl.templateSet)
        .build()
    switch (type) {
    case FileType.LOGI:
        return downloadLogi(model)
    case FileType.TXT:
        return downloadTxt(model)
    case FileType.XLSX:
        return downloadXlsx(model, product.workbook.workbook, data)
    case FileType.ZIP:
        return downloadZip(product)
    default:
        return of(new ExceptionBuilder()
            .message(`Do not support download type ${type} file.`)
            .build())
    }
}

export function downloadLogi(
    model: Readonly<Model>,
): Observable<Readonly<Uint8Array> | Exception> {
    return of(strToUint8Array(JSON.stringify(toJson(model))))
}

function downloadTxt(model: Readonly<Model>): Observable<Readonly<Uint8Array>> {
    return of(strToUint8Array(toText(model)))
}

export function downloadXlsx(
    model: Readonly<Model>,
    workbook: GC.Spread.Sheets.Workbook,
    data?: CoverData,
): Observable<Readonly<Uint8Array> | Exception> {
    return new Observable<Readonly<Uint8Array> | Exception>((
        sub: Subscriber<Readonly<Uint8Array> | Exception>,
    ): void => {
        /**
         * (TODO: yiliang) Find a better way to identify a model.
         */
        const mid = model.book.uuid
        const gcBook = getDownloadExcel(workbook, data, mid)
        const str = JSON.stringify(gcBook)
        gcBook.destroy()
        const successCallback = (ab: ArrayBuffer): void => {
            sub.next(new Uint8Array(ab))
            sub.complete()
        }
        const errorCallback = (error: unknown): void => {
            sub.error(error)
            sub.complete()
        }
        const excelIo = new excel.IO()
        excelIo.save(
            str,
            successCallback,
            errorCallback,
            {useArrayBuffer: true},
        )
    })
}

// tslint:disable-next-line: max-func-body-length
function downloadZip(
    product: Data,
    data?: CoverData,
): Observable<Readonly<Uint8Array> | Exception> {
    return new Observable<Readonly<Uint8Array> | Exception>((
        sub: Subscriber<Readonly<Uint8Array> | Exception>,
    ): void => {
        const model = new ModelBuilder()
            .book(product.book.book)
            .sourceManager(product.src.sourceManager)
            .formulaManager(product.formula.formulaManager)
            .modifierManager(product.modifier.modifierManager)
            .stdHeaderSet(product.tmpl.templateSet)
            .build()
        forkJoin(
            downloadLogi(model),
            downloadXlsx(model, product.workbook.workbook, data),
            downloadTxt(model),
        ).subscribe((
            results: [
                Readonly<Uint8Array> | Exception,
                Readonly<Uint8Array> | Exception,
                Readonly<Uint8Array>,
            ],
        ): void => {
            const logi = results[0]
            const xlsx = results[1]
            // tslint:disable-next-line: no-magic-numbers
            const txt = results[2]
            if (isException(logi)) {
                sub.next(logi)
                sub.complete()
                return
            }
            if (isException(xlsx)) {
                sub.next(logi)
                sub.complete()
                return
            }
            const zip = new JSZip()
            const book = product.book.book
            zip.file(book.name + '.LOGI', new Uint8Array(logi))
            zip.file(book.name + '.xlsx', new Uint8Array(xlsx))
            zip.file(book.name + '.txt', new Uint8Array(txt))
            zip.file(book.name + '.json', JSON.stringify(toJson(model)))
            from(zip.generateAsync({type: 'uint8array'})).subscribe(
                (buffer: Uint8Array): void => {
                    sub.next(buffer)
                },
                // tslint:disable-next-line: no-empty
                (): void => {},
                (): void => sub.complete(),
            )
        })
    })
}
