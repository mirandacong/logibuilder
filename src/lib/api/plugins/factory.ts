// tslint:disable: unknown-instead-of-any
// tslint:disable: limit-indent-for-method-in-class
import {
    Exception,
    ExceptionBuilder,
    isException,
} from '@logi/base/ts/common/exception'
import {Notice} from '@logi/src/lib/api/notice'
import {Subject, Subscription} from 'rxjs'

import {Plugin, PluginType} from './base'
import {BOOK_FORM} from './book'
import {CLIPBOARD_FORM} from './clipboard'
import {DOWNLOAD_FORM} from './download'
import {Emitters, EmittersBuilder} from './emitters'
import {ERROR_FORM} from './error'
import {EXPR_FORM} from './expr/plugin'
import {FOCUS_FORM} from './focus'
import {Form} from './form'
import {FORMULA_FORM} from './formula'
import {HSF_FORM} from './hsf/plugin'
import {MODIFIER_FORM} from './modifier'
import {SHEET_TABS_FORM} from './sheet_tabs'
import {SOURCE_FORM, SOURCE_PLAYGROUND_FORM} from './source'
import {STD_HEADER_FORM} from './std_header'
import {TEMPLATE_FORM} from './template'
import {WORKBOOK_FORM} from './workbook'

class Factory {
    // tslint:disable-next-line: max-func-body-length
    public constructor() {
        this._init()
    }

    public noticeEmitter$ = new Subject<Notice>()

    public buildPlugins(
        types: readonly PluginType[],
    ): readonly Plugin<any>[] | Exception {
        this._instances = new Map<PluginType, Plugin<any>>()
        let degrees = new Map<PluginType, number>()
        for (const type of types) {
            const deps = this._getBuildDeps(type)
            degrees.set(type, deps.length)
            for (const dep of deps)
                if (!types.includes(dep))
                    return new ExceptionBuilder()
                        .message(`Need dependancie: ${dep}.`)
                        .build()
        }
        const topoSorted: PluginType[] = []
        let zeroDegrees = findZeroDegreeTypes(degrees)
        while (zeroDegrees.length > 0) {
            zeroDegrees.forEach((t: PluginType): void => {
                topoSorted.push(t)
                substractDegree(degrees, t, this._buildDeps)
            })
            zeroDegrees = findZeroDegreeTypes(degrees)
        }
        topoSorted.forEach((t: PluginType): void => {
            this._build(t)
        })
        degrees = new Map<PluginType, number>()
        types.forEach((t: PluginType): void => {
            const deps = this._getExecDeps(t).filter(d => types.includes(d))
            degrees.set(t, deps.length)
        })
        const result: Plugin<any>[] = []
        zeroDegrees = findZeroDegreeTypes(degrees)
        while (zeroDegrees.length > 0) {
            zeroDegrees.forEach((t: PluginType): void => {
                const plugin = this._getInstance(t)
                if (plugin === undefined)
                    // tslint:disable-next-line: no-throw-unless-asserts
                    throw Error('')
                result.push(plugin)
                substractDegree(degrees, t, this._execDeps)
            })
            zeroDegrees = findZeroDegreeTypes(degrees)
        }
        return result
    }

    private _buildDeps = new Map<PluginType, readonly PluginType[]>()
    // tslint:disable-next-line: readonly-array
    private _execDeps = new Map<PluginType, PluginType[]>()
    private _factory = new Map<PluginType, Function>()
    private _instances = new Map<PluginType, Plugin<any>>()

    private _init(): void {
        this._factory = new Map<PluginType, Function>()
        const forms = [
            BOOK_FORM,
            DOWNLOAD_FORM,
            EXPR_FORM,
            FOCUS_FORM,
            FORMULA_FORM,
            HSF_FORM,
            MODIFIER_FORM,
            SHEET_TABS_FORM,
            SOURCE_FORM,
            SOURCE_PLAYGROUND_FORM,
            CLIPBOARD_FORM,
            STD_HEADER_FORM,
            WORKBOOK_FORM,
            ERROR_FORM,
            TEMPLATE_FORM,
        ]
        forms.forEach((f: Form): void => {
            this._register(f)
        })
    }

    private _getExecDeps(type: PluginType): readonly PluginType[] {
        return this._execDeps.get(type) ?? []
    }

    private _getBuildDeps(type: PluginType): readonly PluginType[] {
        return this._buildDeps.get(type) ?? []
    }

    private _getInstance(t: PluginType): Plugin<any> | undefined {
        return this._instances.get(t)
    }

    /**
     * Throw error if fail to get instance.
     */
    private _build(t: PluginType): Plugin<any> {
        const deps = this._buildDeps.get(t) ?? []
        const plugins: (Plugin<any> | undefined)[] = []
        deps.forEach((dep: PluginType): void => {
            const instance = this._instances.get(dep)
            plugins.push(instance)
        })
        const ctor = this._factory.get(t)
        if (ctor === undefined)
            // tslint:disable-next-line: no-throw-unless-asserts
            throw Error(`Ctor of ${t} is not found.`)
        const p = Reflect.construct(ctor, plugins)
        p.setNotice(this.noticeEmitter$)
        this._instances.set(t, p)
        return p
    }

    private _register(form: Form): void {
        const type = form.type
        this._buildDeps.set(type, form.deps)
        this._factory.set(type, form.ctor)
        if (!form.reverse) {
            const deps = this._execDeps.get(type) ?? []
            form.deps.forEach((d: PluginType): void => {
                if (deps.includes(d))
                    return
                deps.push(d)
            })
            this._execDeps.set(type, deps)
            return
        }
        form.deps.forEach((t: PluginType): void => {
            const deps = this._execDeps.get(t) ?? []
            if (deps.includes(type))
                return
            deps.push(type)
            this._execDeps.set(t, deps)
        })
    }
}

class ErrorSubject<T> extends Subject<T> {
    // @ts-ignore
    // tslint:disable-next-line: prefer-function-over-method no-unused
    public subscribe(observer: any): Subscription {
        // tslint:disable-next-line: no-throw-unless-asserts
        throw Error('You subscribe to an inavailable subject.')
    }
}

const FACTORY = new Factory()
/**
 * Export only for tests.
 */
export const ERR_SUBJECT = new ErrorSubject<any>()

export function getPluginsAndEmitters(
    types: readonly PluginType[],
): (readonly [readonly Plugin<any>[], Emitters]) | Exception {
    const plugins = FACTORY.buildPlugins(types)
    if (isException(plugins))
        return plugins
    const m = new Map<PluginType, Subject<any>>()
    plugins.forEach((p: Plugin<any>): void => {
        m.set(p.type, p.result$)
    })
    const emitters = new EmittersBuilder()
        .bookEmitter(m.get(PluginType.BOOK) ?? ERR_SUBJECT)
        .sourceEmitter(m.get(PluginType.SOURCE) ?? ERR_SUBJECT)
        .sourcePlaygroundEmitter(m.get(PluginType.SOURCE_PLAYGROUND)
            ?? ERR_SUBJECT)
        .modifierEmitter(m.get(PluginType.MODIFIER) ?? ERR_SUBJECT)
        .downloadEmitter(m.get(PluginType.DOWNLOAD) ?? ERR_SUBJECT)
        .focusEmitter(m.get(PluginType.FOCUS) ?? ERR_SUBJECT)
        .formulaEmitter(m.get(PluginType.FORMULA) ?? ERR_SUBJECT)
        .clipboardEmitter(m.get(PluginType.CLIPBOARD) ?? ERR_SUBJECT)
        .excelEmitter(m.get(PluginType.WORKBOOK) ?? ERR_SUBJECT)
        .stdHeaderEmitter(m.get(PluginType.STD_HEADER) ?? ERR_SUBJECT)
        // tslint:disable-next-line: no-type-assertion
        .sheetTabsEmitter(m.get(PluginType.SHEET_TABS) ?? ERR_SUBJECT as any)
        .errorEmitter(m.get(PluginType.ERROR) ?? ERR_SUBJECT)
        .noticeEmitter(FACTORY.noticeEmitter$)
        .build()
    return [plugins, emitters]
}

function findZeroDegreeTypes(
    m: Map<PluginType, number>,
): readonly PluginType[] {
    const result: PluginType[] = []
    m.forEach((v: number, k: PluginType): void => {
        if (v !== 0)
            return
        result.push(k)
        m.delete(k)
    })
    return result
}

function substractDegree(
    degree: Map<PluginType, number>,
    type: PluginType,
    deps: Map<PluginType, readonly PluginType[]>,
): void {
    deps.forEach((v: readonly PluginType[], k: PluginType): void => {
        if (v.includes(type)) {
            const d = degree.get(k)
            if (d === undefined)
                return
            degree.set(k, d - 1)
        }
    })
}
