import {Node} from './node'

/**
 * The ending node in the trie.
 */
const TERMINATION = ''

/**
 * The root node in the trie.
 */
const ROOT = ''
/**
 * Given a string array, builds the trie.
 */
export function buildTrie(words: readonly string[]): Node {
    const root = new NodeImpl(ROOT)
    words.forEach((word: string) => {
        if (word === '')
            return
        addWord(word, root)
    })

    return root as Node
}

/**
 * Adds a word to a trie.
 */
function addWord(word: string, root: NodeImpl): void {
    let curr = root
    // tslint:disable-next-line: no-loop-statement
    for (const char of word)
        curr = curr.getOrAddChild(char)
    curr.addEndingChild()
}

class NodeImpl implements Node {
    // tslint:disable-next-line: readonly-array
    public get index(): string[] {
        return this.children.map((child: NodeImpl) => child.character)
    }
    public constructor(public readonly character: string) {}

    // tslint:disable-next-line: readonly-array
    public readonly children: NodeImpl[] = []

    public addEndingChild(): void {
        if (this.index.indexOf(TERMINATION) < 0)
            this._addChild(TERMINATION)
    }

    public getOrAddChild(char: string): NodeImpl {
        const idx = this.index.indexOf(char)
        if (idx >= 0)
            return this.children[idx]

        return this._addChild(char)
    }

    /**
     * Adds a new node as a child and returns it.
     */
    private _addChild(character: string): NodeImpl {
        const newNode = new NodeImpl(character)
        this.index.push(character)
        this.children.push(newNode)

        return newNode
    }
}
