import {Template} from '@logi/src/lib/template'
import {Subject} from 'rxjs'

import {Plugin as Base, PluginType, Product, Result} from '../base'
import {FormBuilder} from '../form'

export class Plugin extends Base <Result> {
    public constructor() {
        super()
    }
    public type = PluginType.TEMPLATE
    public result$ = new Subject<Result>()
    public template!: Template
    public handle(input: Readonly<Product>): void {
        this.handlePayloads(input)
        return
    }
}

export const TEMPLATE_FORM = new FormBuilder()
    .type(PluginType.TEMPLATE)
    .deps([])
    .ctor(Plugin)
    .build()
