import {Injectable} from '@angular/core'
import {getBookLabels} from '@logi/src/lib/api'
import {Label} from '@logi/src/lib/hierarchy/core'
import {StudioApiService} from '@logi/src/web/global/api'

@Injectable()
export class LabelDialogService {
    public constructor(
        private readonly _studioApiSvc: StudioApiService,
    ) {
        this.initUsedLabel()
    }
    public getUsedLabel(): readonly Label[] {
        return this._usedLabel
    }

    public getConstLabel(): readonly Label[] {
        return this._constLabel
    }

    public addUsedLabel(label: Label): void {
        if (!this.getUsedLabel().includes(label) &&
            !this._constLabel.includes(label))
            this._usedLabel.push(label)
    }

    public removeUsedLabel(target: Label): void {
        this._usedLabel = this._usedLabel.filter((
            label: Label,
        ): boolean => label !== target)
    }

    /**
     * only used to test
     */
    public initUsedLabel(): void {
        const book = this._studioApiSvc.currBook()
        const labelMap = getBookLabels(book)
        labelMap.forEach((sub: Map<Label, readonly string[]>): void => {
            const keys = Array.from(sub.keys()).filter((key: Label): boolean =>
                typeof key === 'string')
            this._usedLabel = this._usedLabel.concat(keys)
        })
    }

    private _constLabel: readonly Readonly<Label>[] = []
    // tslint:disable-next-line: readonly-array
    private _usedLabel: Label[] = []
}
