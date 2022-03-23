import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {EditorLocation} from '../events/base'

import {PanelStatus, PanelStatusBuilder} from './panel'
import {TextStatus} from './textbox'

export const INVALID_TEXTSTATUS = 1 as unknown as TextStatus
export const INVALID_STATUS = 1 as unknown as Status
export const INVALID_LOCATION = 1 as unknown as EditorLocation
/**
 * The status of an editor including textbox status and panel status.
 *
 *         update           build
 * events =======> status ========> response
 */
export interface Status {
    readonly textStatus: TextStatus
    readonly panelStatus: PanelStatus
    readonly location: Readonly<EditorLocation>
}

class StatusImpl implements Impl<Status> {
    public textStatus!: TextStatus
    public panelStatus: PanelStatus = new PanelStatusBuilder().build()
    public location!: Readonly<EditorLocation>
}

export class StatusBuilder extends Builder<Status, StatusImpl> {
    public constructor(obj?: Readonly<Status>) {
        const impl = new StatusImpl()
        if (obj)
            StatusBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public textStatus(text: TextStatus): this {
        this.getImpl().textStatus = text
        return this
    }

    public panelStatus(panel: PanelStatus): this {
        this.getImpl().panelStatus = panel
        return this
    }

    public location(location: Readonly<EditorLocation>): this {
        this.getImpl().location = location
        return this
    }

    protected get daa(): readonly string[] {
        return StatusBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['location']
}

export function isStatus(obj: unknown): obj is Status {
    return obj instanceof StatusImpl
}
