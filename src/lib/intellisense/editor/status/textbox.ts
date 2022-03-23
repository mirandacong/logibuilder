import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Filter, FilterBuilder} from '../../suggest/solutions/filter'
import {EditorDisplayUnit} from '../display/textbox/unit'
import {UnitType} from '../display/textbox/unit_type'

/**
 * Manage the information of the editor.
 */
export interface TextStatus {
    /**
     * The whole string in the editor text box now. We use a array
     * here for convenient extendable sake.
     */
    readonly text: readonly (string | EditorDisplayUnit)[]
    /**
     * IME for Input Method Editors. Indicate the user is in the process of
     * converting from ime.
     */
    readonly ime: boolean
    /**
     * The cursor offset in the whole text in editor. Used to get the
     * editing segment.
     */
    readonly startOffset: number

    readonly endOffset: number
    /**
     * Get the current filters from the text.
     */
    getFilterInfo(): Readonly<FilterInfo>
}

class TextStatusImpl implements Impl<TextStatus> {
    public text: readonly (string | EditorDisplayUnit)[] = []
    public ime = false
    public startOffset = 0
    public endOffset = 0

    public getFilterInfo(): Readonly<FilterInfo> {
        const result: Filter[] = []
        let textEnd = - 1
        const [start, end]: readonly [number, number] =
            getActiveRefRange(this.endOffset, this.text)
        const activeText = this.text.slice(start + 1, end)
        activeText.forEach((
            unit: string | EditorDisplayUnit,
            idx: number,
        ): void => {
            if (typeof unit === 'string' || !unit.tags
                .includes(UnitType.FILTER))
                return
            result.push(new FilterBuilder().value(unit.content).build())
            if (textEnd < 0)
                textEnd = idx
        })
        if (result.length === 0) {
            const text = (this.text as string[]).join('')
            return new FilterInfoBuilder().text(text).build()
        }
        const t = (this.text.slice(0, textEnd) as string[]).join('')
        const filterText = (activeText
            .slice(textEnd + result.length) as string[]).join('')
        return new FilterInfoBuilder()
            .text(t)
            .filters(result)
            .filterText(filterText)
            .build()
    }
}

// tslint:disable-next-line: max-classes-per-file
export class TextStatusBuilder extends Builder<TextStatus, TextStatusImpl> {
    public constructor(obj?: Readonly<TextStatus>) {
        const impl = new TextStatusImpl()
        if (obj)
            TextStatusBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public text(text: readonly (string | EditorDisplayUnit)[]): this {
        this.getImpl().text = text
        return this
    }

    public ime(ime: boolean): this {
        this.getImpl().ime = ime
        return this
    }

    public startOffset(value: number): this {
        this.getImpl().startOffset = value
        return this
    }

    public endOffset(value: number): this {
        this.getImpl().endOffset = value
        return this
    }
}

function getActiveRefRange(
    offset: number,
    text: readonly (string | EditorDisplayUnit)[],
): readonly [number, number] {
    let i = offset - 1
    while (i > 0 && typeof text[i] === 'string' && text[i] !== '{')
        i -= 1
    let j = offset
    while (j < text.length - 1 && typeof text[j] === 'string' && text[i] !== '}')
        j += 1
    return [i, j]
}

/**
 * Get the filter info from the text status. It will be convenient to get
 * adviser.
 */
export interface FilterInfo {
    readonly filters: readonly Filter[]
    readonly text: string
    readonly filterText: string
}

class FilterInfoImpl implements Impl<FilterInfo> {
    public filters: readonly Filter[] = []
    public text = ''
    public filterText = ''
}

export class FilterInfoBuilder extends Builder<FilterInfo, FilterInfoImpl> {
    public constructor(obj?: Readonly<FilterInfo>) {
        const impl = new FilterInfoImpl()
        if (obj)
            FilterInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public filters(filters: readonly Filter[]): this {
        this.getImpl().filters = filters
        return this
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    public filterText(filterText: string): this {
        this.getImpl().filterText = filterText
        return this
    }
}

export function isFilterInfo(obj: unknown): obj is FilterInfo {
    return obj instanceof FilterInfoImpl
}
