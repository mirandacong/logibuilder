/**
 * T: The type of n and the subnodes of n.
 * S: The type of the data passed in the graph.
 */
export type VisitorFunction<T, S> =
    // tslint:disable-next-line: no-any
    (n: T, data: any) => readonly [readonly S[], readonly T[]]
/**
 * Pre order walk with strong readable consistency ordering.
 * This function is more expensive(time complexities) than `preOrderWalk2`, if
 * it is necessary for readable result (maybe help for writing test), use this
 * function, otherwrise `preOrderWalk2`.
 * For example:
 *           1
 *          / \
 *         2   3
 *        /     \
 *       4       5
 *              / \
 *             6   7
 * The result is ['1', '2', '4', '3', '5', '6', '7']
 *
 * @param node: The node to walk
 * @param fn: (n: Node) => [T[], Node[]]: The call back function for visiting a
 * node, the input is a hierarchy node, the output[0] is a generic type, the
 * output[1] is the nodes to be visited.
 * @param data: Additional parameter to the fn.
 */
export function preOrderWalk<T, S>(
    node: T,
    fn: VisitorFunction<T, S>,
    // tslint:disable-next-line: no-any no-optional-parameter
    data?: any,
): readonly S[] {
    const stack = [node]
    const nodes: S[] = []
    // tslint:disable-next-line: no-loop-statement
    while (stack.length !== 0) {
        const n = stack.shift() as T
        const info = fn(n, data)
        nodes.push(...info[0])
        stack.unshift(...info[1])
    }

    return nodes
}

/**
 * Pre order walk with consistency ordering but not readable.
 * If there is no need for the ordering of brother node, use this function,
 * otherwrise `preOrderWalk`, because `preOrderWalk` is more expensive than
 * this function.
 *
 * @param node: The node to walk
 * @param fn: (n: Node) => [T[], Node[]]: The call back function for visiting a
 * node, the input is a hierarchy node, the output[0] is a generic type, the
 * output[1] is the nodes to be visited.
 * @param data: Additional parameter to the fn.
 */
export function preOrderWalk2<T, S>(
    node: T,
    fn: VisitorFunction<T, S>,
    // tslint:disable-next-line: no-any no-optional-parameter
    data?: any,
): readonly S[] {
    const stack = [node]
    const nodes: S[] = []
    // tslint:disable-next-line: no-loop-statement
    while (stack.length !== 0) {
        const n = stack.pop() as T
        const info = fn(n, data)
        nodes.push(...info[0])
        stack.push(...info[1])
    }

    return nodes
}

/**
 * Post order walk for node with strong readable consistency ordering.
 *
 * This function is more expensive(time complexities) than `postOrderWalk2`, if
 * it is necessary for readable result (maybe help for writing test), use this
 * function, otherwrise `postOrderWalk2`.
 *           1
 *          / \
 *         2   3
 *        /     \
 *       4       5
 *              / \
 *             6   7
 *
 * The result is ['4', '2', '6', '7', '5', '3', '1']
 *
 * @param node: The node to walk
 * @param fn: (n: Node, walkInfoList) => T: The call back function for visiting
 * a node, the input of this function is a hierarchy node, the output is a
 * generic type.
 * @param data: Additional parameter to the fn.
 */
export function postOrderWalk<T, S>(
    // tslint:disable-next-line: max-params
    node: T,
    // tslint:disable-next-line: no-any
    fn: (n: T, data: any) => readonly S[],
    getSubnodes: (n: T) => readonly T[],
    // tslint:disable-next-line: no-any no-optional-parameter
    data?: any,
): readonly S[] {
    const stack1: T[] = [node]
    const stack2: T[] = []
    const result: S[] = []
    // tslint:disable-next-line: no-loop-statement
    while (stack1.length > 0) {
        // Safe to use type assertion, checked above.
        const n = stack1.shift() as T
        const subnodes = getSubnodes(n)
        const containsAll: boolean = subnodes
            .map((sub: T) => stack2.includes(sub))
            .reduce((a: boolean, b: boolean) => a && b, true)
        if (containsAll) {
            result.push(...fn(n, data))
            stack2.push(n)
        } else
            stack1.unshift(...subnodes, n)
    }

    return result
}

/**
 * Post order walk with consistency ordering but not readable.
 *
 * If there is no need for the ordering of brother node, use this function,
 * otherwrise `postOrderWalk`, because `postOrderWalk` is more expensive than
 * this function.
 *
 * @param node: The node to walk
 * @param fn: (n: Node, walkInfoList) => T: The call back function for visiting
 * a node, the input of this function is a hierarchy node, the output is a
 * generic type.
 * @param getSubnodes: The call back function for gettingsubnodes.
 * @param data: Additional parameter to the fn.
 */
export function postOrderWalk2<T, S>(
    // tslint:disable-next-line: max-params
    node: T,
    // tslint:disable-next-line: no-any
    fn: (n: T, data: any) => readonly S[],
    getSubnodes: (n: T) => readonly T[],
    // tslint:disable-next-line: no-any no-optional-parameter
    data?: any,
): readonly S[] {
    const stack1: T[] = [node]
    const stack2: T[] = []
    const result: S[] = []
    // tslint:disable-next-line: no-loop-statement
    while (stack1.length > 0) {
        // Safe to use type assertion, checked above.
        const n = stack1.pop() as T
        const subnodes = getSubnodes(n)
        const containsAll: boolean = subnodes
            .map((sub: T) => stack2.includes(sub))
            .reduce((a: boolean, b: boolean) => a && b, true)
        if (containsAll) {
            result.push(...fn(n, data))
            stack2.push(n)
        } else
            stack1.push(n, ...subnodes)
    }

    return result
}
