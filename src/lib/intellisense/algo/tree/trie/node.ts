/**
 * Trie is used to accelerate searching string.
 * A node in trie represents a character.
 */
export interface Node {
    readonly character: string
    readonly children: readonly Node[]
    // Records the character of its children.
    readonly index: readonly string[]
}
