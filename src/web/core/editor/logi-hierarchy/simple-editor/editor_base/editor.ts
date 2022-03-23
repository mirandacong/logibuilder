import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {EditorDisplayUnit, UnitType} from '@logi/src/lib/intellisense'
import {getUnitClass} from '@logi/src/lib/visualizer'
import {ElementRangeBuilder, setElementRange} from '@logi/src/web/base/editor'
import {fromEvent, Observable} from 'rxjs'

export interface Editor {
    keydown$(): Observable<KeyboardEvent>
    click$(): Observable<MouseEvent>
    mousedown$(): Observable<MouseEvent>
    mousemove$(): Observable<MouseEvent>
    mouseup$(): Observable<MouseEvent>
    mouseleave$(): Observable<MouseEvent>
    mouseenter$(): Observable<MouseEvent>
    mouseout$(): Observable<MouseEvent>
    mouseover$(): Observable<MouseEvent>
    focus$(): Observable<FocusEvent>
    blur$(): Observable<FocusEvent>
    input$(): Observable<InputEvent>
    compositionstart$(): Observable<CompositionEvent>
    compositionupdate$(): Observable<CompositionEvent>
    compositionend$(): Observable<CompositionEvent>
    copy$(): Observable<ClipboardEvent>
    paste$(): Observable<ClipboardEvent>
    renderContent(units: readonly Readonly<EditorDisplayUnit>[]): void
    setElementRange(start: number, end: number): void
}

class EditorImpl implements Impl<Editor> {
    public container!: HTMLElement

    public keydown$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(this.container, 'keydown')
    }

    public click$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'click')
    }

    public mousedown$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'mousedown')
    }

    public mousemove$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'mousemove')
    }

    public mouseup$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'mouseup')
    }

    public mouseleave$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'mouseleave')
    }

    public mouseenter$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'mouseenter')
    }

    public mouseout$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'mouseout')
    }

    public mouseover$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'mouseover')
    }

    public focus$(): Observable<FocusEvent> {
        return fromEvent<FocusEvent>(this.container, 'focus')
    }

    public blur$(): Observable<FocusEvent> {
        return fromEvent<FocusEvent>(this.container, 'blur')
    }

    public input$(): Observable<InputEvent> {
        return fromEvent<InputEvent>(this.container, 'input')
    }

    public compositionstart$(): Observable<CompositionEvent> {
        return fromEvent<CompositionEvent>(this.container, 'compositionstart')
    }

    public compositionupdate$(): Observable<CompositionEvent> {
        return fromEvent<CompositionEvent>(this.container, 'compositionupdate')
    }

    public compositionend$(): Observable<CompositionEvent> {
        return fromEvent<CompositionEvent>(this.container, 'compositionend')
    }

    public copy$(): Observable<ClipboardEvent> {
        return fromEvent<ClipboardEvent>(this.container, 'copy')
    }

    public paste$(): Observable<ClipboardEvent> {
        return fromEvent<ClipboardEvent>(this.container, 'paste')
    }

    public renderContent(units: readonly EditorDisplayUnit[]): void {
        const container = this.container
        /**
         * Remove all child element.
         * https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
         *
         * TODO (kai): Compare innerHTML and removeChild.
         */
        while (container.lastChild)
            container.removeChild(container.lastChild)
        let text = ''
        units.forEach((unit: EditorDisplayUnit, index: number): void => {
            const classList = unit.tags
                .map((tag: UnitType): string => getUnitClass(tag) || '')
                .filter((c: string): boolean => c.length > 0)
                .join(' ')
            const converted = unit.content.replace(/\s/g, '&nbsp;')
            text += (`<span class='${classList}' data-index=${index}>` +
                `${converted}</span>`)
        })
        /**
         * TODO (kai): Find another way.
         */
        // tslint:disable-next-line: no-inner-html
        container.innerHTML = text
    }

    public setElementRange(start: number, end: number): void {
        /**
         * TODO (kai): Do not set selection when init content.
         */
        if (start === -1 && end === -1) {
            document.getSelection()?.removeAllRanges()
            /**
             * Make element lose focus for do not let user input.
             */
            this.container.blur()
            return
        }
        const builder = new ElementRangeBuilder()
        if (start < end)
            builder.start(start).end(end)
        else
            builder.start(end).end(start)
        setElementRange(this.container, builder.build())
    }
}

export class EditorBuilder extends Builder<Editor, EditorImpl> {
    public constructor(obj?: Readonly<Editor>) {
        const impl = new EditorImpl()
        if (obj)
            EditorBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public container(container: HTMLElement): this {
        this.getImpl().container = container
        return this
    }

    protected get dda(): readonly string[] {
        return EditorBuilder.__DDA_PROPS__
    }
    protected static readonly __DDA_PROPS__: readonly string[] = ['container']
}
