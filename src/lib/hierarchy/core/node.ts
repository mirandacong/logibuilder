/**
 * @fileoverview Excel-like hierarchy tree embedding the computation graph.
 */
import {Builder} from '@logi/base/ts/common/builder'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {getUuid} from '@logi/base/ts/common/uuid'
import {ProducerVersion} from '@logi/base/ts/common/version'

import {AnnotationKey} from './annotation'
import {Label} from './label'
import {Part, PartBuilder, Path, PathBuilder} from './path'

export enum NodeType {
    /**
     * Meaningless enum type.
     */
    TYPE_UNSPECIFIED = 0,
    BOOK = 1,
    SHEET = 2,
    TITLE = 3,
    TABLE = 4,
    ROW_BLOCK = 5,
    COLUMN_BLOCK = 6,
    ROW = 7,
    COLUMN = 8,
}

/**
 * Base abstract class representing a node in Excel.
 *
 * All other classes, namely, Cell, Row, Table, Title, Sheet, Book are derived
 * from this class.
 */
export abstract class Node {
    public get parent(): Readonly<Node > | null {
        return this._parent
    }

    public set parent(parent: Readonly<Node> | null) {
        if (this._parent === parent)
            return
        if (this._parent !== null) {
            const unsafe = this._parent.asUnsafe()
            const pos = unsafe.subnodes.indexOf(this)
            if (pos !== -1)
                unsafe.subnodes.splice(pos, 1)
        }
        this._parent = parent
    }

    public readonly name!: string

    public readonly labels: readonly Label[] = []
    public readonly annotations: ReadonlyMap<AnnotationKey, string> =
        new Map<AnnotationKey, string>()

    public readonly abstract nodetype: NodeType

    public readonly version?: Readonly<ProducerVersion>
    public readonly uuid!: string

    /**
     * Convert this object to an interface to allow modifying internal states.
     *
     * This method is intended to be used in the transpiler and visualizer
     * functions.
     */
    public asUnsafe(): UnsafeNode {
        // @ts-ignore: Type incompatibility.
        // tslint:disable-next-line: no-type-assertion
        return this as UnsafeNode
    }

    /**
     * TODO (minglong): use protected instead of public.
     */
    public insertSubnode(
        node: Readonly<Node>,
        position = this.subnodes.length,
    ): void {
        (node as Writable<Node>).parent = this
        const subNodes = this.subnodes as Readonly<Node>[]
        subNodes.splice(position, 0, node)
    }

    /**
     * TODO (minglong): use protected instead of public.
     */
    public deleteSubnode(node: Readonly<Node>): void {
        const subNodes = this.subnodes as Readonly<Node>[]
        const index = subNodes.indexOf(node as Readonly<Node>)
        if (index < 0)
            return
        subNodes.splice(index, 1)
    }

    public replaceSubnode(old: Readonly<Node>, updated: Readonly<Node>): void {
        const subNodes = this.subnodes as Readonly<Node>[]
        const index = subNodes.indexOf(old as Readonly<Node>)
        if (index < 0)
            return
        subNodes.splice(index, 1, updated)
    }

    /**
     * Get ancestors of current node (contains itself).
     * For example, here is the graph, the result of `getAncestors` of `f` is
     * ['a', 'd', 'e', 'f'].
     *
     *          a
     *         / \
     *        b   d
     *       /     \
     *      c       e
     *               \
     *                f
     */
    public getAncestors(): readonly Readonly<Node>[] {
        const nodePath: Readonly<Node>[] = []
        // tslint:disable-next-line: no-this-assignment
        let current: Readonly<Node> = this
        // tslint:disable-next-line: no-loop-statement
        while (current) {
            nodePath.unshift(current)
            // Safe to use type assertion because type of Node's parent is Node.
            current = current.parent as Node
        }
        return nodePath
    }

    // tslint:disable-next-line:max-func-body-length
    public getPath(): Path {
        const stack: Readonly<Node>[] = [this]
        const parts: Part[] = []
        // tslint:disable-next-line: no-loop-statement
        while (stack.length > 0) {
            // Safe to use type assertion below, checked in while.
            const node = stack.pop() as Readonly<Node>
            parts.unshift(new PartBuilder()
                .name(node.name)
                .labels(node.labels)
                .build())
            if (node.nodetype !== NodeType.SHEET && node.parent !== null)
                // Unsafe to use type assertion below, need to confirm that the
                // parent of this node MUST be a `Node`, not other class which
                // extends MetaNode.
                stack.push(node.parent)
        }
        return new PathBuilder().parts(parts).build()
    }

    /**
     * Get parent via the given type.
     */
    public findParent(expect: NodeType): Readonly<Node> | undefined {
        if (this.nodetype === expect)
            return this
        const stack: Readonly<Node>[] = []
        if (this.parent !== undefined && this.parent !== null)
            stack.push(this.parent)
        while (stack.length > 0) {
            const p = stack.pop() as Readonly<Node>
            if (expect === p.nodetype)
                return p

            if (p.parent !== undefined && p.parent !== null)
                stack.push(p.parent)
        }
        return
    }

    /**
     * The parent of the node.
     *
     * This property defaults to null, which means this object is a root level
     * object.
     */
    // tslint:disable-next-line: ext-variable-name no-null-keyword
    protected _parent: Readonly<Node > | null = null
    protected readonly subnodes: readonly Readonly<Node>[] = []
}

export function isNode(obj: unknown): obj is Readonly<Node> {
    return obj instanceof Node
}

export function assertIsNode(obj: unknown): asserts obj is Readonly<Node> {
    if (!(obj instanceof Node))
        throw Error('Not a Node!')
}

/**
 * Unsafe interface for Node.
 */
export interface UnsafeNode {
    // tslint:disable-next-line: readonly-array
    readonly subnodes: Node[]
}

/**
 * Base builder class for Excel Node instances.
 */
export class NodeBuilder<T extends Node, S extends Impl<T>> extends
Builder<T, S> {
    protected get daa(): readonly string[] {
        return NodeBuilder.__DAA_PROPS__
    }

    public name(name: string): this {
        this._getImpl().name = name.trim()

        return this
    }

    public labels(labels: readonly Label[]): this {
        this._getImpl().labels = labels

        return this
    }

    public uuid(uuid: string): this {
        this._getImpl().uuid = uuid
        return this
    }

    public annotations(annotations: ReadonlyMap<AnnotationKey, string>): this {
        this._getImpl().annotations = annotations
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = ['name', 'uuid']

    // tslint:disable-next-line: ext-variable-name
    protected _getImpl(): Impl<Node> {
        return this.getImpl()
    }

    protected preBuildHook(): void {
        if (this.getImpl().uuid === undefined)
            this.getImpl().uuid = getUuid()
    }
}

/**
 * The subnode of book need to implement this interface.
 */
export interface BookSubnode {
    /**
     * The hierarchy node which is the subnode of book has this function.
     * The return type is `Node` because of the cyclic dependency, so far the
     * `book.ts` depend on `node.ts`, the dependency graph is like following
     *
     *      `book.ts` --> `node.ts` (`book.ts` depend on `node.ts`)
     *
     * If the return type is `Book`, the `node.ts` need to depend on `book.ts`,
     * the dependency graph will be like following
     *
     *      `book.ts` <--> `node.ts`
     */
    getBook(): Readonly<Node> | undefined
}

/**
 * The subnode of table need to implement this interface.
 */
export interface TableSubnode {
    /**
     * The hierarchy node which is the subnode of table has this function.
     * The return type is `Node` because of the cyclic dependency, so far the
     * `table.ts` depend on `node.ts`, the dependency graph is like following
     *
     *      `table.ts` --> `node.ts` (`table.ts` depend on `node.ts`)
     *
     * If the return type is `Book`, the `node.ts` need to depend on `table.ts`,
     * the dependency graph will be like following
     *
     *      `table.ts` <--> `node.ts`
     */
    getTable(): Readonly<Node> | undefined
}
