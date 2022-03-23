export const BASE = 1024
export const UNITS = [
    Unit.BYTES,
    Unit.KB,
    Unit.MB,
    Unit.GB,
    Unit.TB,
    Unit.PB,
    Unit.EB,
    Unit.ZB,
    Unit.YB,
] as const
export const enum Unit {
    BYTES = 'Bytes',
    KB = 'KB',
    MB = 'MB',
    GB = 'GB',
    TB = 'TB',
    PB = 'PB',
    EB = 'EB',
    ZB = 'ZB',
    YB = 'YB',
}
