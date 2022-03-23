export class WalkerInfo<T> {
    // tslint:disable-next-line: readonly-array
    public constructor(private readonly _status: T[]) {}

    public getStatus(): readonly T[] {
        return [...this._status]
    }

    public consume(): readonly T[] {
        if (this._childrenLeft.length === 0)
            return []
        const last = this._childrenLeft.pop()
        if (last === undefined)
            return []
        if (last === 1) {
            const result = this.getStatus()
            this._status.pop()
            return result
        }
        this._childrenLeft.push(last - 1)
        return this.getStatus()
    }

    public addChildren(cnt: number, s: T): void {
        this._childrenLeft.push(cnt)
        this._status.push(s)
    }

    // tslint:disable-next-line: readonly-array
    private _childrenLeft: number[] = []
}
