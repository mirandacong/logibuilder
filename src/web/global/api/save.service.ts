import {Injectable, Optional} from '@angular/core'
import {StudioApiService} from '@logi/src/web/global/api'
import {
    ActionBuilder,
    ButtonGroupBuilder,
    DialogService,
    InputDialogDataBuilder,
} from '@logi/src/web/ui/dialog'
import {of} from 'rxjs'
import {DownloadActionBuilder} from '@logi/src/lib/api'
import {FileType} from '@logi/base/ts/common/file_type'
import {DownloadService} from './download.service'
const CANCEL = new ActionBuilder().text('取消').run(() => of(true)).build()

@Injectable()
export class SaveAsService {
    public constructor(
        private readonly _downloadSvc: DownloadService,
        @Optional()
        private readonly _studioApiSvc: StudioApiService,
        private readonly _dialogSvc: DialogService,
    ) { }
    public saveAsModel (): void {
        this.cloneModel()
    }

    public cloneModel() {
        const onConfirm = (name: string) => {
            this._downloadSvc.setFileName(name)
            const action = new DownloadActionBuilder()
                .type(FileType.LOGI)
                .build()
            this._studioApiSvc.handleAction(action)
            return of(true)
        }
        const buttonGroup = new ButtonGroupBuilder()
            .secondary([CANCEL])
            .primary(new ActionBuilder()
                .text('确定')
                .run(onConfirm.bind(this))
                .build())
            .build()
        const dialogData = new InputDialogDataBuilder()
            .title('另存模型')
            .buttonGroup(buttonGroup)
            .build()
        this._dialogSvc.openInputDialog(dialogData)
    }
}
