import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
} from '@angular/core'
import {Subscription} from 'rxjs'

const DEFAULT_LOADING_TEXT = '正在加载...'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-spinner',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SpinnerComponent implements OnDestroy {
    @Input() public size = 20
    @Input() public loadingText = DEFAULT_LOADING_TEXT

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    public hasLoadingText(): boolean {
        return this.loadingText.length !== 0
    }

    private _subs = new Subscription()
}
