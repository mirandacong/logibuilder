import {Injectable, Injector} from '@angular/core'
import {NodeType} from '@logi/src/lib/hierarchy/core'
import {StudioApiService} from '@logi/src/web/global/api'
import {BehaviorSubject, Observable} from 'rxjs'

/**
 * Service for node expanded state toggle and change notification.
 * only editor
 */
@Injectable()
export class NodeExpandService {
    public constructor(
        public readonly injector: Injector,
    ) {
        this._studioApiSvc = this.injector.get(StudioApiService)
    }

    /**
     * Listen the node expanded state change.
     */
    // tslint:disable-next-line: readonly-array
    public listenStateChange (): Observable<string[]> {
        return this._stateChange$
    }

    /**
     * Toggle node expanded state.
     */
    public toggleState (nodes: readonly Readonly<string>[]): void {
        this.baseToggle(nodes)
    }

    public baseToggle (nodes: readonly Readonly<string>[]): void {
        const parents: string[] = []
        const parentsTypes = [
            NodeType.ROW_BLOCK,
            NodeType.COLUMN_BLOCK,
            NodeType.TABLE,
        ]
        nodes.forEach(uuid => {
            const node = this._studioApiSvc.getNode(uuid)
            if (node === undefined)
                return
            parents.push(...node
                .getAncestors()
                .filter(n => parentsTypes.includes(n.nodetype))
                .map(n => n.uuid))
        })
        this._stateChange$.next(parents)
    }
    private readonly _studioApiSvc: StudioApiService

    // tslint:disable-next-line: readonly-array
    private readonly _stateChange$ = new BehaviorSubject<string[]>([])
}
