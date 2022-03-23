import {Injectable} from '@angular/core'
import {AddFbService} from '@logi/src/web/core/editor/add-fb'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {SaveAsService} from '@logi/src/web/global/api'
import {
    Service as ShortcutRegistry,
} from '@logi/src/web/global/shortcut/service'

@Injectable()
export class ShortcutService {
    public constructor(
        private readonly _nodeEditSvc: NodeEditService,
        private readonly _shortcutRegistry: ShortcutRegistry,
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _addFbSvc: AddFbService,
        private readonly _saveAsSvc: SaveAsService,
    ) { }

    public registerShortcuts (isReadonly = false): void {
        isReadonly ? this._readonlyMode() : this.normalMode()
    }

    // tslint:disable-next-line: max-func-body-length
    public normalMode (): void {
        this._shortcutRegistry.add(['f2'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.focusExpr()
        })
        this._shortcutRegistry
            .add(['ctrl+s', 'command+s'], (e: Event): void => {
                e.preventDefault()
            })
        this._shortcutRegistry.add(
            ['ctrl+shift+s', 'command+shift+s'],
            (e: Event): void => {
                e.preventDefault()
                this._saveAsSvc.saveAsModel()
            },
        )
        this._shortcutRegistry.add(['ctrl+c', 'command+c'], (
            e: Event,
        ): void => {
            e.preventDefault()
            this._nodeEditSvc.copy()
        })
        this._shortcutRegistry.add(['ctrl+x', 'command+x'], (
            e: Event,
        ): void => {
            e.preventDefault()
            this._nodeEditSvc.cut()
        })
        this._shortcutRegistry.add(['ctrl+v', 'command+v'], (
            e: Event,
        ): void => {
            e.preventDefault()
            this._nodeEditSvc.paste()
        })
        this._shortcutRegistry.add(['ctrl+z', 'command+z'], (
            e: Event,
        ): void => {
            e.preventDefault()
            this._nodeEditSvc.undo()
        })
        this._shortcutRegistry.add(['ctrl+y', 'command+y'], (
            e: Event,
        ): void => {
            e.preventDefault()
            this._nodeEditSvc.redo()
        })
        this._shortcutRegistry.add(['ctrl+i', 'command+i'], (
            e: Event,
        ): void => {
            e.preventDefault()
            this._nodeEditSvc.insert()
        })
        this._shortcutRegistry.add(['del'], (e: Event): void => {
            e.preventDefault()
            this._nodeEditSvc.remove()
        })
        this._shortcutRegistry.add(['esc'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.cancelAllSelect()
        })
        this._shortcutRegistry.add(['ctrl+a', 'command+a'], (
            e: Event,
        ): void => {
            e.preventDefault()
            this._nodeFocusSvc.selectAll()
        })
        this._shortcutRegistry.add(['up'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.selectPrevious()
        })
        this._shortcutRegistry.add(['down'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.selectNext()
        })
        this._shortcutRegistry.add(['shift+up'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.continuousSelectWithKeyboard(true)
        })
        this._shortcutRegistry.add(['shift+down'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.continuousSelectWithKeyboard(false)
        })
        this._shortcutRegistry.add(['alt+s'], (e: Event): void => {
            e.preventDefault()
            this._nodeEditSvc.batchAddSlices()
        })
        this._shortcutRegistry.add(['alt+shift+s'], (e: Event): void => {
            e.preventDefault()
            this._nodeEditSvc.cancelSlices()
        })
        this._shortcutRegistry.add(['enter'], (e: Event): void => {
            e.preventDefault()
            const table = this._addFbSvc.getLastTable()
            if (table === undefined)
                return
            this._nodeEditSvc.addRow(table)
        })
        this._shortcutRegistry.add(['tab'], (e: Event): void => {
            e.preventDefault()
            e.stopPropagation()
        })
    }

    public unregisterAll (): void {
        this._shortcutRegistry.removeAll()
    }

    // tslint:disable-next-line: max-func-body-length
    private _readonlyMode (): void {
        this._shortcutRegistry.add(
            ['ctrl+shift+s', 'command+shift+s'],
            (e: Event): void => {
                e.preventDefault()
                this._saveAsSvc.saveAsModel()
            },
        )
        this._shortcutRegistry.add(['esc'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.cancelAllSelect()
        })
        this._shortcutRegistry.add(['ctrl+a', 'command+a'], (
            e: Event,
        ): void => {
            e.preventDefault()
            this._nodeFocusSvc.selectAll()
        })
        this._shortcutRegistry.add(['up'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.selectPrevious()
        })
        this._shortcutRegistry.add(['down'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.selectNext()
        })
        this._shortcutRegistry.add(['shift+up'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.continuousSelectWithKeyboard(true)
        })
        this._shortcutRegistry.add(['shift+down'], (e: Event): void => {
            e.preventDefault()
            this._nodeFocusSvc.continuousSelectWithKeyboard(false)
        })
        this._shortcutRegistry.add(['tab'], (e: Event): void => {
            e.preventDefault()
            e.stopPropagation()
        })

        this._shortcutRegistry.add(['f2'], (e: Event): void => {
            e.preventDefault()
        })
        this._shortcutRegistry
            .add(['ctrl+s', 'command+s'], (e: Event): void => {
                e.preventDefault()
            })
        this._shortcutRegistry.add(['ctrl+c', 'command+c'], (
            e: Event,
        ): void => {
            e.preventDefault()
        })
        this._shortcutRegistry.add(['ctrl+x', 'command+x'], (
            e: Event,
        ): void => {
            e.preventDefault()
        })
        this._shortcutRegistry.add(['ctrl+v', 'command+v'], (
            e: Event,
        ): void => {
            e.preventDefault()
        })
        this._shortcutRegistry.add(['ctrl+z', 'command+z'], (
            e: Event,
        ): void => {
            e.preventDefault()
        })
        this._shortcutRegistry.add(['ctrl+y', 'command+y'], (
            e: Event,
        ): void => {
            e.preventDefault()
        })
        this._shortcutRegistry.add(['ctrl+i', 'command+i'], (
            e: Event,
        ): void => {
            e.preventDefault()
        })
        this._shortcutRegistry.add(['del'], (e: Event): void => {
            e.preventDefault()
        })
    }
}
