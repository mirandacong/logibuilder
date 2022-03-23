import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface DepsStorage {
    getDeps(fb: string, slice?: string): readonly string[]
    getRdeps(fb: string): readonly string[]
}

export class DepsManager implements DepsStorage {
    public setDeps(deps: readonly string[], fb: string, slice?: string): void {
        let currNode = this._depsMap.get(fb)
        if (currNode === undefined) {
            currNode = new FormulaBearerBuilder().fbId(fb).build()
            this._depsMap.set(fb, currNode)
        }
        const nodes = deps.map((dep: string): FormulaBearer => {
            let node = this._depsMap.get(dep)
            if (node !== undefined)
                return node
            node = new FormulaBearerBuilder().fbId(dep).build()
            this._depsMap.set(dep, node)
            return node
        })
        currNode.setDeps(nodes, slice)
    }

    public getDeps(fb: string, slice?: string): readonly string[] {
        const node = this._depsMap.get(fb)
        if (node === undefined)
            return []
        const deps = slice === undefined
            ? node.deps
            : node.getSliceDeps(slice)
        return deps.map((d: FormulaBearer): string => d.fbId)
    }

    public getRdeps(fb: string): readonly string[] {
        const node = this._depsMap.get(fb)
        if (node === undefined)
            return []
        return node.rdeps.map((d: FormulaBearer): string => d.fbId)
    }

    public clearFb(fb: string): void {
        const node = this._depsMap.get(fb)
        if (node === undefined)
            return
        node.deps.forEach((dep: FormulaBearer): void => {
            dep.removeRdeps(node)
        })
    }

    private _depsMap = new Map<string, FormulaBearer>()
}

interface FormulaBearer {
    readonly fbId: string
    readonly deps: readonly FormulaBearer[]
    readonly rdeps: readonly FormulaBearer[]
    setDeps(deps: readonly FormulaBearer[], slice?: string): void
    getSliceDeps(slice: string): readonly FormulaBearer[]
    addRdeps(dep: FormulaBearer): void
    removeRdeps(dep: FormulaBearer): void
}

class FormulaBearerImpl implements Impl<FormulaBearer> {
    public fbId!: string
    public get deps(): readonly FormulaBearer[] {
        if (this._sliceDeps.size === 0)
            return this._deps
        /**
         * If this formula bearer contains slices, return the set of slice deps.
         */
        const nodesSet = new Set<FormulaBearer>()
        this._sliceDeps.forEach((nodes: readonly FormulaBearer[]): void => {
            nodes.forEach((node: FormulaBearer): void => {
                nodesSet.add(node)
            })
        })
        return Array.from(nodesSet)
    }

    public get rdeps(): readonly FormulaBearer[] {
        return Array.from(this._rdeps)
    }

    public setDeps(deps: readonly FormulaBearer[], slice?: string): void {
        /**
         * Clear the curr deps and slice deps, then set the new deps.
         */
        if (slice === undefined) {
            this.deps.forEach((node: FormulaBearer): void => {
                node.removeRdeps(this)
            })
            this._sliceDeps = new Map()
            this._deps = deps
            deps.forEach((node: FormulaBearer): void => {
                node.addRdeps(this)
            })
            return
        }
        /**
         * Clear the curr deps of formula
         */
        this._deps.forEach((node: FormulaBearer): void => {
            node.removeRdeps(this)
        })
        this._deps = []
        deps.forEach((node: FormulaBearer): void => {
            node.addRdeps(this)
        })
        const sliceDeps = this._sliceDeps.get(slice)
        if (sliceDeps === undefined) {
            this._sliceDeps.set(slice, deps)
            return
        }
        const newDepNodes = new Set<FormulaBearer>(deps)
        this._sliceDeps.forEach((
            nodes: readonly FormulaBearer[],
            key: string,
        ): void => {
            if (key === slice)
                return
            nodes.forEach((node: FormulaBearer): void => {
                newDepNodes.add(node)
            })
        })
        /**
         * Remove the old deps of the old slice that not in the new deps.
         */
        sliceDeps.forEach((node: FormulaBearer): void => {
            if (!newDepNodes.has(node))
                node.removeRdeps(this)
        })
        this._sliceDeps.set(slice, deps)
    }

    public getSliceDeps(slice: string): readonly FormulaBearer[] {
        return this._sliceDeps.get(slice) ?? []
    }

    public addRdeps(dep: FormulaBearer): void {
        this._rdeps.add(dep)
    }

    public removeRdeps(dep: FormulaBearer): void {
        this._rdeps.delete(dep)
    }

    /**
     * The deps of each slice
     */
    private _sliceDeps = new Map<string, readonly FormulaBearer[]>()
    /**
     * The deps of the formular.
     */
    private _deps: readonly FormulaBearer[] = []
    private _rdeps = new Set<FormulaBearer>()
}

class FormulaBearerBuilder extends Builder<FormulaBearer, FormulaBearerImpl> {
    public constructor(obj?: Readonly<FormulaBearer>) {
        const impl = new FormulaBearerImpl()
        if (obj)
            FormulaBearerBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public fbId(fbId: string): this {
        this.getImpl().fbId = fbId
        return this
    }

    protected get daa(): readonly string[] {
        return FormulaBearerBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['fbId']
}
