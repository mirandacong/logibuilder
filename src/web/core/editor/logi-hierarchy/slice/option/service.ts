import {Injectable} from '@angular/core'
import {lcsLenMatch} from '@logi/src/lib/intellisense'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {BehaviorSubject} from 'rxjs'

@Injectable()
export class OptionService {
    public constructor(
        private readonly _apiSvc: StudioApiService,
    ) {}
    public init(fbId: string, sliceName: string, currOption?: string): void {
        this._options = this._apiSvc.suggestSliceNames(fbId, sliceName)
        if (!currOption ||
            currOption?.trim() === '' ||
            this._options.length > 0
        )
            this._currOption$.next(this._options[0])
        this._optionsChange$.next(this._options)
    }

    public search(pattern: string): void {
        if (pattern.trim().length === 0) {
            this._optionsChange$.next(this._options)
            return
        }
        const options = lcsLenMatch(pattern, this._options).map(m => m[0])
        this._optionsChange$.next(options)
        this._currOption$.next(options[0])
    }

    public listenOptionsChange(): BehaviorSubject<readonly string[]> {
        return this._optionsChange$
    }

    public listenCurrOptionChange(): BehaviorSubject<string> {
        return this._currOption$
    }
    private _optionsChange$ = new BehaviorSubject<readonly string[]>([])
    private _currOption$ = new BehaviorSubject<string>('')
    private _options: readonly string[] = []
}
