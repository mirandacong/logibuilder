import {ChangeDetectionStrategy, Component, Input} from '@angular/core'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-empty',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class EmptyComponent {
    @Input() public set message(value: string | undefined) {
        if (value === undefined)
            return
        this._message = value === '' ? '暂无数据' : value
    }

    public get message(): string {
        return this._message
    }

    @Input() public imgUrl = ''

    private _message = '数据缺失，正在修复'
}
