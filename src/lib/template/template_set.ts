import {StandardHeader} from './standard_header'
import {Builder} from '@logi/base/ts/common/builder'

import {Template} from './template'

export interface TemplateSet {
    readonly templates: readonly Readonly<Template>[]
    readonly standardHeaders: readonly Readonly<StandardHeader>[]
    readonly defaultHeader: string | undefined
    add(template: Readonly<Template>): void
    remove(template: Readonly<Template>): void
}

class TemplateSetImpl implements TemplateSet {
    // tslint:disable-next-line: readonly-array
    public templates: Readonly<Template>[] = []
    // tslint:disable-next-line: readonly-array
    public standardHeaders: Readonly<StandardHeader>[] = []
    public defaultHeader: string | undefined
    public add(template: Readonly<Template>): void {
        this.templates.push(template)
    }

    public remove(template: Readonly<Template>): void {
        const index = this.templates.indexOf(template)
        if (index === -1)
            return
        this.templates.splice(index, 1)
    }
}

export class TemplateSetBuilder extends Builder<TemplateSet, TemplateSetImpl> {
    public constructor(obj?: Readonly<TemplateSet>) {
        const impl = new TemplateSetImpl()
        if (obj)
            TemplateSetBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    // tslint:disable-next-line: readonly-array
    public templates(templates: Readonly<Template>[]): this {
        this.getImpl().templates = templates
        return this
    }

    public standardHeaders(
        // tslint:disable-next-line: readonly-array
        standardHeaders: Readonly<StandardHeader>[],
    ): this {
        this.getImpl().standardHeaders = standardHeaders
        return this
    }

    public defaultHeader(defaultHeader?: string): this {
        this.getImpl().defaultHeader = defaultHeader
        return this
    }
}

export function isTemplateSet(obj: unknown): obj is TemplateSet {
    return obj instanceof TemplateSetImpl
}
