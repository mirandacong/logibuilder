import {Injectable} from '@angular/core'
import {FileResult} from '@logi/src/lib/api'
import {saveAs} from '@logi/src/web/base/file'

import {StudioApiService} from './service'
import {FileType} from '@logi/base/ts/common/file_type'

@Injectable()
export class DownloadService {
    public constructor(
        private readonly _studioApiSvc: StudioApiService,
    ) {
        this._studioApiSvc.downloadChange().subscribe(n => {
            this._handle(n)
        })
    }

    public setFileName(name: string): void {
        this._name = name
    }

    private _name = ''

    private _handle(result: FileResult): void {
        if (result.excel)
            saveAs(new Blob([result.excel]), `${this._name}${FileType.XLSX}`)
        if (result.logi)
            saveAs(new Blob([result.logi]), `${this._name}${FileType.LOGI}`)
        if (result.txt)
            saveAs(new Blob([result.txt]), `${this._name}${FileType.TXT}`)
        if (result.zip)
            saveAs(new Blob([result.zip]), `${this._name}${FileType.ZIP}`)
    }
}
