export interface CommandOp {
    readonly name: string,
    readonly command: {},
    readonly key?: number,
    readonly ctrl?: boolean,
    readonly shift?: boolean,
    readonly alt?: boolean,
    readonly meta?: boolean,
}
