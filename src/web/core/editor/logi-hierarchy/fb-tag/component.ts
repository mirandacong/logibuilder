import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core'
import {Type as FbTagType} from '@logi/src/lib/hierarchy/core'
import {trackByFnReturnItem} from '@logi/src/web/base/track-by'

interface TypeItem {
    readonly value: string
    readonly type: FbTagType
}

const TYPE_DATA: readonly (readonly [FbTagType, string])[] = [
    [FbTagType.ASSUMPTION, '假设'],
    [FbTagType.FACT, '事实'],
    [FbTagType.FX, '计算'],
]

const TYPE_ITEMS: readonly TypeItem[] = TYPE_DATA.map(
    (data: readonly [FbTagType, string]): TypeItem => {
        return {type: data[0], value: data[1]}
    },
)

const TYPE_ITEMS_MAP = new Map<FbTagType, string>(TYPE_DATA)

const TYPE_CLASS_MAP = new Map<FbTagType, string>([
    [FbTagType.ASSUMPTION, 'asm'],
    [FbTagType.FACT, 'fact'],
    [FbTagType.FX, 'fx'],
])

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-fb-tag',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class FbTagComponent {
    @Input() public set type(type: FbTagType) {
        this._type = type
        this.value = TYPE_ITEMS_MAP.get(type) ?? ''
    }

    // tslint:disable: ng-no-get-and-set-property
    public get type(): FbTagType {
        return this._type
    }

    public get items(): readonly TypeItem[] {
        return TYPE_ITEMS
    }

    @Input() public empty = false
    @Input() public readonly = false

    @Output() public readonly typeChange$ = new EventEmitter<FbTagType>()
    @Output() public readonly menuMouseDown$ = new EventEmitter<MouseEvent>()
    public trackBy = trackByFnReturnItem

    public value = ''

    public onSelectType(type: FbTagType): void {
        this.typeChange$.next(type)
    }

    public onMouseDown(e: MouseEvent): void {
        this.menuMouseDown$.next(e)
    }

    // tslint:disable-next-line: prefer-function-over-method
    public getTypeClass(type: FbTagType): string {
        return TYPE_CLASS_MAP.get(type) ?? ''
    }

    private _type: FbTagType = FbTagType.FX
}
