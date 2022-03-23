// tslint:disable: readonly-array
class Selector<T> {
    constructor(
        public readonly model: LinkSelection<T>,
        // tslint:disable-next-line: parameter-properties
        public value: T | null = null,
    ) {}

    // 可用的选项列表
    get options(): readonly T[] {
        const value = this.value
        const allOptions = this.model.options
        const selectedOptions = this.model.selected
        const unselected = allOptions.filter(d => !selectedOptions.includes(d))
        return value ? [value, ...unselected] : unselected
    }

    select(value: T): void {
        this.value = value
    }
}

/**
 * 针对可以动态添加选择框，并且不能重复选择相同的值的场景
 */
export class LinkSelection<T> {
    constructor(public readonly options: readonly T[]) {
        this.selectors.push(new Selector<T>(this))
    }

    selectors: Selector<T>[] = []

    // 当前选中项
    get selected(): T[] {
        const result: T[] = []
        this.selectors.forEach(s => {
            if (s.value === null)
                return
            result.push(s.value)
        })
        return result
    }

    // 增加一个选择器
    addSelector(): void {
        this.selectors.push(new Selector<T>(this))
    }

    removeSelector(index: number): void {
        if (index < 0 || index > this.selectors.length - 1)
            return
        this.selectors.splice(index, 1)
    }
}
