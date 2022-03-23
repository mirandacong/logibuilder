import {Node} from './node'

/**
 * The ending node in the trie.
 */
const TERMINATION = ''

/**
 * The invalid string.
 */
const EMPTY = ''

/**
 * The root node of this trie.
 */
const ROOT = ''
/**
 * Build the abbr trie. Returns the root of this trie.
 */
export function buildTrie(phrases: readonly string[]): Node {
    const root = new NodeImpl(ROOT)
    phrases.forEach((phrase: string): void => {
        if (phrase === '')
            return
        addPhrase(phrase, root)
    })

    return root as Node
}

/**
 * The main process of `buildTrie`, add phrase to a trie.
 */
function addPhrase(phrase: string, root: NodeImpl): void {
    if (phrase === EMPTY)
        return
    let curr = root
    const words: string[] = phrase.split(' ')
    if (words.length === 0)
        return
    // Safe to use 'as', check above.
    const firstWord = words.shift() as string
    words.unshift(firstWord[0], firstWord.substr(1))
    words.forEach((word: string): void => {
        curr = curr.getOrAddChild(word)
    })
    curr.addEndingChild()
}

class NodeImpl implements Node {
    public constructor(public readonly word: string) {}
    // tslint:disable-next-line: readonly-array
    public readonly children: NodeImpl[] = []

    public getOrAddChild(word: string): NodeImpl {
        // tslint:disable-next-line: no-loop-statement
        for (const child of this.children)
            if (word === child.word)
                return child

        return this._addChild(word)
    }

    public addEndingChild(): void {
        // tslint:disable-next-line: no-loop-statement
        for (const child of this.children)
            if (child.word === TERMINATION)
                return
        this._addChild(TERMINATION)
    }

    private _addChild(word: string): NodeImpl {
        const newNode = new NodeImpl(word)
        this.children.push(newNode)

        return newNode
    }
}
