import {Builder} from '@logi/base/ts/common/builder'

import {EmptyStrategy, Seeker, Target, TargetBuilder} from '../seeker'

import {buildDict, Dict} from './dict'
import {Edge} from './node'

class ContextSeekerImpl implements Seeker {
    public caseSensitive = false
    public emptyStrategy = EmptyStrategy.EMPTY

    public dict!: Dict

    public seek(context: readonly string[]): readonly Target[] {
        const phrases = this._recommendPhrases(context)
        return phrases.map((phrase: string): Target => new TargetBuilder()
            .content(phrase)
            .matchedMap(new Map<number, number>())
            .build())
    }

    private _top = 5

    /**
     * Gets all the phrases which are possible to occur according to `context`.
     */
    private _recommendPhrases(context: readonly string[]): readonly string[] {
        const counter = new Map<number, number>()
        // tslint:disable-next-line: no-loop
        for (const phrase of context) {
            const currNode = this.dict.getNode(phrase)
            if (currNode === undefined)
                continue
            currNode.edges.forEach((key: Edge): void => {
                if (!counter.has(key.destination)) {
                    const freq = key.probability
                    counter.set(key.destination, freq)
                    return
                }
                const current = counter.get(key.destination)
                if (typeof current === 'number')
                    counter.set(key.destination, current + key.probability *
                    currNode.weight)
            })
        }
        const recommends = [...counter.entries()]
            .sort((a: [number, number], b: [number, number]): number =>
                b[1] - a[1])
            .map((x: [number, number]): number => x[0])

        return recommends
            .map((index: number): string => this.dict.array[index].phrase)
            .slice(0, this._top)
    }
}

export class ContextSeekerBuilder extends Builder<Seeker, ContextSeekerImpl> {
    public constructor(obj?: Readonly<Seeker>) {
        const impl = new ContextSeekerImpl()
        if (obj)
            ContextSeekerBuilder.shallowCopy(obj, impl)
        super(impl)
    }

    public data(value: readonly string[]): this {
        this.getImpl().dict = buildDict(value)
        return this
    }

    public caseSensitive(value: boolean): this {
        this.getImpl().caseSensitive = value
        return this
    }

    public emptyStrategy(value: EmptyStrategy): this {
        this.getImpl().emptyStrategy = value
        return this
    }

    protected static __DAA_PROPS__: readonly string[] = ['dict']

    protected get daa(): readonly string[] {
        return ContextSeekerBuilder.__DAA_PROPS__
    }
}
