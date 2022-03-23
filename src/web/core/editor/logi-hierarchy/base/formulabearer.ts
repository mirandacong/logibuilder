import {ElementRef, Injector, ViewChild, Directive} from '@angular/core'
import {SetTypeBuilder} from '@logi/src/lib/api'
import {FormulaBearer, Type as TagType} from '@logi/src/lib/hierarchy/core'
import {
    ElementRangeBuilder,
    pastePlainText,
    setElementRange,
} from '@logi/src/web/base/editor'
import {fromEvent} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {Base} from './node'

// tslint:disable-next-line: comment-for-export-and-public
@Directive({selector: '[logi-formulabearer]'})
export class Formulabearer extends Base {
    public constructor(public readonly injector: Injector) {
        super(injector)
    }
    public node!: Readonly<FormulaBearer>
    @ViewChild('ref_name', {static: true})
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public refNameInput!: ElementRef<HTMLElement>
    public showLabelContent = true

    public updateNameInput(displayname: string): void {
        const native = this.refNameInput.nativeElement
        native.textContent = displayname
        this.name = displayname
        this.cd.detectChanges()
    }

    public fbInit(): void {
        const input = this.refNameInput.nativeElement
        fromEvent<ClipboardEvent>(input, 'paste')
            .pipe(takeUntil(this.destroyed$))
            .subscribe(pastePlainText)
        fromEvent<FocusEvent>(input, 'focus')
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                const offset = input.textContent?.length ?? 0
                setElementRange(input, new ElementRangeBuilder()
                    .start(offset)
                    .end(offset)
                    .build())
            })
        this.updateNameInput(this.node.name)
    }

    public setTagType(type: TagType): void {
        const action = new SetTypeBuilder()
            .target(this.node.uuid)
            .type(type)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    /**
     * Common label numbers getter.
     */
    public labelNums(): string {
        const len = this.node.labels.length
        if (!len)
            return ''
        return `${len} 标签`
    }

    public isNodeAsSlice(): boolean {
        return this.node !== undefined && this.node.sliceExprs.length > 0
    }

    public isEmpty(): boolean {
        return this.node.expression.trim().length === 0
    }
}
