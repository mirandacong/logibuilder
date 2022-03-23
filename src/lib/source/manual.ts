import {SourceType} from './base'
import {
    StandardSource,
    StandardSourceBuilder,
    StandardSourceImpl,
} from './standard'

/**
 * The value input in `Data` viewed by user.
 */
export interface ManualSource extends Readonly<StandardSource> {}

class ManualSourceImpl extends StandardSourceImpl implements ManualSource {
    public get sourceType(): SourceType {
        return SourceType.MANUAL
    }
}

export class ManualSourceBuilder extends
    StandardSourceBuilder<ManualSource, ManualSourceImpl> {
    public constructor(obj?: Readonly<ManualSource>) {
        const impl = new ManualSourceImpl()
        if (obj)
            ManualSourceBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isManualSource(obj: unknown): obj is ManualSource {
    return obj instanceof ManualSourceImpl
}
