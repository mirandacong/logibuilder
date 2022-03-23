import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Template, TemplateSet} from '@logi/src/lib/template'

import {PayloadType} from '../payload'

import {Payload as Base} from './payload'

export interface Payload extends Base {
    readonly template: Template
}

class PayloadImpl extends Base implements Impl<Payload> {
    public template!: Template
    public payloadType = PayloadType.ADD_TEMPLATE
}

export class PayloadBuilder extends Builder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public template(template: Template): this {
        this.getImpl().template = template
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'template',
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a Payload!')
}

export function addTemplate(set: TemplateSet, template: Template): void {
    // tslint:disable-next-line: no-type-assertion
    const templates = set.templates as Template[]
    templates.push(template)
}
