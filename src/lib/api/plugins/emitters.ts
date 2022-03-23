import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Notice} from '@logi/src/lib/api/notice'
import {Subject} from 'rxjs'

import {BookResult} from './book'
import {ClipboardResult} from './clipboard'
import {ErrorResult} from './error'
import {FileResult} from './file_result'
import {FocusResult} from './focus'
import {FormulaResult} from './formula'
import {ModifierResult} from './modifier'
import {SheetTabsResult} from './sheet_tabs'
import {PlaygroundResult, SourceResult} from './source'
import {StdHeaderResult} from './std_header'
import {WorkbookResult} from './workbook'

export interface Emitters {
    readonly sheetTabsEmitter: Subject<SheetTabsResult>
    /**
     * If hierarchy book changed because of actions, `void` will be emitted.
     */
    readonly bookEmitter: Subject<BookResult>

    /**
     * If some sources changed, `void` will be emitted.
     */
    readonly sourceEmitter: Subject<SourceResult>
    readonly sourcePlaygroundEmitter: Subject<PlaygroundResult>
    readonly formulaEmitter: Subject<FormulaResult>
    readonly modifierEmitter: Subject<ModifierResult>

    readonly stdHeaderEmitter: Subject<StdHeaderResult>
    /**
     * If the excel book changed, it will be sent.
     */
    readonly excelEmitter: Subject<WorkbookResult>
    readonly downloadEmitter: Subject<FileResult>
    readonly focusEmitter: Subject<FocusResult>
    readonly clipboardEmitter: Subject<ClipboardResult>
    readonly noticeEmitter: Subject<Notice>
    readonly errorEmitter: Subject<ErrorResult>
}

class EmittersImpl implements Impl<Emitters> {
    public sheetTabsEmitter!: Subject<SheetTabsResult>
    public bookEmitter!: Subject<BookResult>
    public sourceEmitter!: Subject<SourceResult>
    public sourcePlaygroundEmitter!: Subject<PlaygroundResult>
    public formulaEmitter!: Subject<FormulaResult>
    public modifierEmitter!: Subject<ModifierResult>
    public stdHeaderEmitter!: Subject<StdHeaderResult>
    public excelEmitter!: Subject<WorkbookResult>
    public downloadEmitter!: Subject<FileResult>
    public focusEmitter!: Subject<FocusResult>
    public clipboardEmitter!: Subject<ClipboardResult>
    public noticeEmitter!: Subject<Notice>
    public errorEmitter!: Subject<ErrorResult>
}

export class EmittersBuilder extends Builder<Emitters, EmittersImpl> {
    public constructor(obj?: Readonly<Emitters>) {
        const impl = new EmittersImpl()
        if (obj)
            EmittersBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public sheetTabsEmitter(sheetTabsEmitter: Subject<SheetTabsResult>): this {
        this.getImpl().sheetTabsEmitter = sheetTabsEmitter
        return this
    }

    public bookEmitter(bookEmitter: Subject<BookResult>): this {
        this.getImpl().bookEmitter = bookEmitter
        return this
    }

    public sourceEmitter(sourceEmitter: Subject<SourceResult>): this {
        this.getImpl().sourceEmitter = sourceEmitter
        return this
    }

    public sourcePlaygroundEmitter(emitter: Subject<PlaygroundResult>): this {
        this.getImpl().sourcePlaygroundEmitter = emitter
        return this
    }

    public formulaEmitter(formulaEmitter: Subject<FormulaResult>): this {
        this.getImpl().formulaEmitter = formulaEmitter
        return this
    }

    public modifierEmitter(modifierEmmiter: Subject<ModifierResult>): this {
        this.getImpl().modifierEmitter = modifierEmmiter
        return this
    }

    public stdHeaderEmitter(stdHeaderEmitter: Subject<StdHeaderResult>): this {
        this.getImpl().stdHeaderEmitter = stdHeaderEmitter
        return this
    }

    public excelEmitter(excelEmitter: Subject<WorkbookResult>): this {
        this.getImpl().excelEmitter = excelEmitter
        return this
    }

    public downloadEmitter(downloadEmitter: Subject<FileResult>): this {
        this.getImpl().downloadEmitter = downloadEmitter
        return this
    }

    public focusEmitter(focusEmitter: Subject<FocusResult>): this {
        this.getImpl().focusEmitter = focusEmitter
        return this
    }

    public clipboardEmitter(clipboardEmitter: Subject<ClipboardResult>): this {
        this.getImpl().clipboardEmitter = clipboardEmitter
        return this
    }

    public noticeEmitter(noticeEmitter: Subject<Notice>): this {
        this.getImpl().noticeEmitter = noticeEmitter
        return this
    }

    public errorEmitter(errorEmitter: Subject<ErrorResult>): this {
        this.getImpl().errorEmitter = errorEmitter
        return this
    }

    protected get daa(): readonly string[] {
        return EmittersBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'bookEmitter',
        'downloadEmitter',
        'excelEmitter',
        'focusEmitter',
        'formulaEmitter',
        'modifierEmitter',
        'noticeEmitter',
        'sourceEmitter',
        'clipboardEmitter',
        'stdHeaderEmitter',
        'errorEmitter',
    ]
}

export function isEmitters(value: unknown): value is Emitters {
    return value instanceof EmittersImpl
}

export function assertIsEmitters(value: unknown): asserts value is Emitters {
    if (!(value instanceof EmittersImpl))
        throw Error('Not a Emitters!')
}
