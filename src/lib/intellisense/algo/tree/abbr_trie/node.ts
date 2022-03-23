/**
 * The node of an abbr_trie.
 * It's same as a common trie but its value
 * in a node is a word rather than a character.
 *
 *     +---+
 *     | A +------------------+
 *     +-+-+                  |
 *       |                    |
 *     +-v---------+       +--v---------+
 *     |  ddtional |       | djustments |
 *     +-+---------+       +--+---------+
 *       |                    |
 *     +-v-----------+     +--v--+
 *     | Inventory   |     |     |
 *     +-+-----------+     +-----+ end
 *       |
 *     +-v------+
 *     |  Items |
 *     +-+------+
 *       |
 *     +-v-+
 *     |   | end
 *     +---+
 */
export interface Node {
    readonly word: string
    readonly children: readonly Node[]
}
