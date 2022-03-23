import {SourceType} from './base'
import {
    StandardSource,
    StandardSourceBuilder,
    StandardSourceImpl,
} from './standard'

/**
 * The value input in `Data` viewed by database.
 */
export interface DatabaseSource extends Readonly<StandardSource> {}

class DatabaseSourceImpl extends StandardSourceImpl implements DatabaseSource {
    public get sourceType(): SourceType {
        return SourceType.DATABASE
    }
}

export class DatabaseSourceBuilder extends
    StandardSourceBuilder<DatabaseSource, DatabaseSourceImpl> {
    public constructor(obj?: Readonly<DatabaseSource>) {
        const impl = new DatabaseSourceImpl()
        if (obj)
            DatabaseSourceBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isDatabaseSource(obj: unknown): obj is DatabaseSource {
    return obj instanceof DatabaseSourceImpl
}
