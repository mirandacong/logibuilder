import {ChangeDetectionStrategy, Component} from '@angular/core'
import {MatDialogRef} from '@angular/material/dialog'

const SRC = '/src/web/common/about/img_about.png'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-about',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class AboutComponent {
    public constructor(
        private readonly _dialogRef: MatDialogRef<AboutComponent>,
    ) { }
    public version = ''
    public imgSrc: string = SRC

    /**
     * Close dialog
     */
    public onClose (): void {
        this._dialogRef.close()
    }
}
