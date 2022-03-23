import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core'
import {isFormulaBearer, isNode} from '@logi/src/lib/hierarchy/core'
import {StudioApiService} from '@logi/src/web/global/api'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-node',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class NodeComponent implements OnInit {
    public constructor(
        private readonly _studioApiSvc: StudioApiService,
    ) {}
    @Input() public uuid = ''
    @Input() public main = false
    public name = ''
    public expression = ''
    public ngOnInit(): void {
        const fb = this._studioApiSvc.getNode(this.uuid)
        if (fb === undefined || !isNode(fb))
            return
        this.name = fb.name
        if (!isFormulaBearer(fb))
            return
        this.expression = fb.expression
    }
}
