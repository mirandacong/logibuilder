import 'reflect-metadata'
import {isException} from '@logi/base/ts/common/exception'
import {Notice} from '@logi/src/lib/api/notice'
import {
    Emitters,
    getPluginsAndEmitters,
    Plugin,
    PluginType,
} from '@logi/src/lib/api/plugins'
import {injectable} from 'inversify'
import {Subject} from 'rxjs'

export interface BaseService {
    // tslint:disable-next-line: unknown-instead-of-any
    readonly plugins: readonly Plugin<any>[]
    readonly noticeEmitter$: Subject<Notice>
    /**
     * Record the sub undo that has changed.
     */
    recordUndo(types: readonly PluginType[]): void
    clearHistory(): void
    getEmitters(): Readonly<Emitters>
    lock(): void
    unlock(): void
}

@injectable()
export class BaseServiceImpl implements BaseService {
    public constructor(
        public readonly pluginTypes: readonly PluginType[] = [],
    ) {
        this._initPlugins()
    }
    public noticeEmitter$!: Subject<Notice>

    // tslint:disable-next-line: unknown-instead-of-any
    public plugins!: readonly Plugin<any>[]
    // tslint:disable-next-line: prefer-function-over-method
    public getEmitters(): Emitters {
        return this._emitters
    }

    public lock(): void {
        if (this._locked)
            // tslint:disable-next-line: no-console
            console.log('上个action还未完成, 请不要在监听emitters中发送action')
        this._locked = true
    }

    public unlock(): void {
        this._locked = false
    }

    public recordUndo(types: readonly PluginType[]): void {
        const supportHistory = [
            PluginType.BOOK,
            PluginType.STD_HEADER,
            PluginType.SOURCE,
            PluginType.FOCUS,
            PluginType.MODIFIER,
        ]
        if (types.find((t: PluginType): boolean =>
            supportHistory.includes(t)) === undefined)
            return
        this.undoStack.push(types)
        this.redoStack = []
    }

    public clearHistory(): void {
        this.undoStack = []
        this.redoStack = []
    }

    // tslint:disable-next-line: readonly-array
    protected undoStack: (readonly PluginType[])[] = []
    // tslint:disable-next-line: readonly-array
    protected redoStack: (readonly PluginType[])[] = []

    private _locked = false
    private _emitters!: Emitters

    private _initPlugins(): void {
        const result = getPluginsAndEmitters(this.pluginTypes)
        if (isException(result))
            // tslint:disable-next-line: no-throw-unless-asserts
            throw Error('build plugins error.')
        this.plugins = result[0]

        this._emitters = result[1]
        this.noticeEmitter$ = this._emitters.noticeEmitter
    }
}
