import {DatetimeDelta} from '@logi/base/ts/common/datetime'

export class Filter {
    public type!: FilterType
}

export class LogicalOp extends Filter {
    public constructor(
        public readonly children: readonly Filter[],
        public readonly opType: LogicalOpType,
    ) {
        super()
    }
    public type = FilterType.LOGICAL_OP
}

export function isLogicalOp(obj: unknown): obj is LogicalOp {
    return obj instanceof LogicalOp
}

export class Constant extends Filter {
    public constructor(public readonly value: string) {
        super()
    }

    public type = FilterType.CONSTANT
}

export function isConstant(obj: unknown): obj is Constant {
    return obj instanceof Constant
}

export class DistanceOp extends Filter {
    public constructor(
        public readonly distType: DistanceType,
        /**
         * Current year is 2018 and window size is 5 years.
         * 2016   2017   2018   2019   2020    2021
         *   |-------------|-------------|
         *     half size
         *   |---------------------------|
         *             window size
         */
        public readonly halfSize: DatetimeDelta,
    ) {
        super()
    }
    public type = FilterType.DISTANCE_OP
}

export function isDistanceOp(obj: unknown): obj is DistanceOp {
    return obj instanceof DistanceOp
}

export class SameTimeOp extends Filter {
    public constructor(public readonly sameType: SameType) {
        super()
    }
    public type = FilterType.SAME_TIME_OP
}

export function isSameTimeOp(obj: unknown): obj is SameTimeOp {
    return obj instanceof SameTimeOp
}

// tslint:disable-next-line: max-classes-per-file
export class FrequencyOp extends Filter {
    public constructor(public readonly frequencyType: FrequencyType) {
        super()
    }
    public type = FilterType.FREQUENCY_OP
}

export function isFrequencyOp(obj: unknown): obj is FrequencyOp {
    return obj instanceof FrequencyOp
}

export const enum FilterType {
    CONSTANT,
    LOGICAL_OP,
    DISTANCE_OP,
    SAME_TIME_OP,
    FREQUENCY_OP,
}

export const enum LogicalOpType {
    AND,
    OR,
    NOT,
}

export const enum DistanceType {
    LATTER,
    LATTER_OR_EQUAL,
    PREVIOUS,
    PREVIOUS_OR_EQUAL,
    SURROUND,
    SURROUND_OR_EQUAL,
}

export const enum SameType {
    MONTH,
    QUATER,
    YEAR,
    RANGE,
}

export const enum FrequencyType {
    YEAR,
    HALF_YEAR,
    QUARTER,
    MONTH,
}
