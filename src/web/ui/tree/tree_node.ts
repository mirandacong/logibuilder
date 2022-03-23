import {Builder} from '@logi/base/ts/common/builder'
import {Observable} from 'rxjs'
import {take} from 'rxjs/operators'

export interface TreeNode<T> {
    readonly dataNode: T
    readonly disabled: boolean
    readonly expandable: boolean
    readonly id: string
    readonly level: number
    readonly name: string
    readonly tooltip: string
    readonly visible: boolean
}

export class TreeNodeImpl<T> implements TreeNode<T> {
    // tslint:disable-next-line: no-null-keyword
    public parent: TreeNode<T> | null = null
    public children: readonly TreeNode<T>[] = []
    public id!: string
    public dataNode!: T
    public expandable!: boolean
    public name!: string
    public level!: number
    public visible = true
    public disabled = false
    public tooltip = ''

    public setParent(node: TreeNode<T> | null): void {
        this.parent = node
    }

    public setChildren(children: readonly TreeNode<T>[]): void {
        this.children = children
    }

    public hidden(): void {
        this.visible = false
    }

    public show(): void {
        this.visible = true
    }

    public getParents(): readonly TreeNodeImpl<T>[] {
        const parents: TreeNodeImpl<T>[] = []
        let parent = this.parent
        while (parent !== null) {
            const internalParent = toInteranlNode(parent)
            parents.push(internalParent)
            parent = internalParent.parent
        }
        return parents
    }
}

export class TreeNodeBuilder<T> extends Builder<TreeNode<T>, TreeNodeImpl<T>> {
    public constructor(obj?: Readonly<TreeNode<T>>) {
        const impl = new TreeNodeImpl<T>()
        if (obj)
            TreeNodeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public id(id: string): this {
        this.getImpl().id = id
        return this
    }

    public dataNode(dataNode: T): this {
        this.getImpl().dataNode = dataNode
        return this
    }

    public expandable(expandable: boolean): this {
        this.getImpl().expandable = expandable
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public level(level: number): this {
        this.getImpl().level = level
        return this
    }

    public disabled(disable?: boolean): this {
        this.getImpl().disabled = disable ?? false
        return this
    }

    public tooltip(tooltip: string): this {
        this.getImpl().tooltip = tooltip
        return this
    }

    protected get daa(): readonly string[] {
        return TreeNodeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'id',
        'dataNode',
        'expandable',
        'name',
        'level',
    ]
}

export function isTreeNode<T>(value: unknown): value is TreeNode<T> {
    return value instanceof TreeNodeImpl
}

export function assertIsTreeNode<T>(
    value: unknown,
): asserts value is TreeNode<T> {
    if (!(value instanceof TreeNodeImpl))
        throw Error('Not a TreeNode!')
}

/**
 * Use this in module. Do not export it from tree module.
 */
export function toInteranlNode<T>(node: TreeNode<T>): TreeNodeImpl<T> {
    // tslint:disable-next-line: no-type-assertion
    return node as TreeNodeImpl<T>
}

// tslint:disable: readonly-array
export function setHierarchy<T>(
    treeNodes: TreeNode<T>[],
    childrenFn: (node: T) => Observable<T[]> | T[] | undefined | null,
): void {
    const nodeMap = new Map<T, TreeNode<T>>()
    treeNodes.forEach(d => {
        nodeMap.set(d.dataNode, d)
    })
    const setLink = (children: T[], parent: TreeNode<T>): void => {
        const treeNodeChildren: TreeNode<T>[] = []
        children.forEach(c => {
            const treeNode = nodeMap.get(c)
            if (treeNode === undefined)
                return
            toInteranlNode(treeNode).setParent(parent)
            treeNodeChildren.push(treeNode)
        })
        toInteranlNode(parent).setChildren(treeNodeChildren)
    }
    treeNodes.forEach(treeNode => {
        const children = childrenFn(treeNode.dataNode)
        if (!children)
            return
        if (Array.isArray(children)) {
            setLink(children, treeNode)
            return
        }
        children.pipe(take(1)).subscribe(c => setLink(c, treeNode))
    })
}
