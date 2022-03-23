import {CdkPortal} from '@angular/cdk/portal'
import {Injectable} from '@angular/core'

@Injectable({providedIn: 'root'})
export class ErrorInfoService {
    public registry(portal: CdkPortal): void {
        this._portals.push(portal)
    }

    public close(): void {
        this._portals.forEach(p => {
            if (!p.isAttached)
                return
            p.detach()
        })
    }
    // tslint:disable-next-line: readonly-array
    private _portals: CdkPortal[] = []
}
