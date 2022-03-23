// tslint:disable-next-line: no-wildcard-import
import * as uuid from 'uuid'

/**
 * UUID (Universally Unique Identifier)
 * See: https://en.wikipedia.org/wiki/Universally_unique_identifier
 *
 * API: https://github.com/uuidjs/uuid#api
 */
export function getUuid(): string {
    return uuid.v4()
}
