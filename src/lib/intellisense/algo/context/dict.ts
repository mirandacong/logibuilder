import {Edge, Node, NodeBuilder} from './node'

export class Dict {
    public constructor(public readonly array: readonly Node[]) {}

    public getNode(phrase: string): Node | undefined {
        if (this._map.has(phrase))
        // Save to use type assertion, check in if.
            return this.array[this._map.get(phrase) as number]
        // tslint:disable-next-line: no-loop-statement
        for (let i = 0; i < this.array.length; i += 1)
            if (this.array[i].phrase === phrase) {
                this._map.set(phrase, i)
                return this.array[i]
            }
        return
    }
    /**
     * Make a cache to record the index of phrases.
     */
    private _map: Map<string, number> = new Map()
}

export function buildDict(items: readonly string[]): Dict {
    const result: Node[] = []
    // tslint:disable-next-line: no-loop-statement
    items.forEach((item: string): void => {
        if (item === '')
            return
        const data = item.split('|')
        const phrase = data[0]
        const weight = Number(data[1])
        const edgeStart = 2
        const edges = data.slice(edgeStart).map((edgeData: string): Edge => {
            const edge = edgeData.split(' ')
            return new Edge(Number(edge[0]), Number(edge[1]))
        })
        const node = new NodeBuilder()
            .phrase(phrase)
            .weight(weight)
            .edges(edges)
            .build()
        result.push(node)
    })
    return new Dict(result)
}
