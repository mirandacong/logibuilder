import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    Book,
    FB_TYPES,
    FormulaBearer,
    getNodesVisitor,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'

import {CellManager, CellStorage} from './cells'
import {DepsManager, DepsStorage} from './deps'
import {ErrorManager, ErrorStorage} from './errors'
import {Node as Est} from './est'
import {buildExprDigest, isExprDigest} from './expr_digest'

export class ExprManager {
    public get depsStorage(): DepsStorage {
        return this._depsManager
    }

    public get cellStorage(): CellStorage {
        return this._cellManager
    }

    public get errorStorage(): ErrorStorage {
        return this._errorManager
    }

    public getEst(fbId: string, slice?: string): Readonly<Est> | void {
        const id = getExprId(fbId, slice ?? '')
        return this._est.get(id)
    }

    /**
     * Parse all expression in the book and store the results including
     * ests, cells, deps and errors.
     */
    public convert(book: Readonly<Book>): void {
        this._clear()
        // tslint:disable-next-line: no-type-assertion
        const fbs = preOrderWalk(
            book,
            getNodesVisitor,
            FB_TYPES,
        ) as FormulaBearer[]
        fbs.forEach((fb: FormulaBearer): void => {
            if (fb.sliceExprs.length === 0) {
                this._addExpr(fb)
                return
            }
            fb.sliceExprs.forEach((slice: SliceExpr): void => {
                this._addExpr(fb, slice)
            })
        })
    }

    /**
     * Update the est, cells, deps and errors of a formula bearer.
     * If the `updateEst` is false, use the last est if exist, and only update
     * cells, deps and errors for performance reasons.
     */

    public updateExpr(fb: Readonly<FormulaBearer>, updateEst = true): void {
        this._clearFb(fb)
        if (fb.sliceExprs.length === 0) {
            const oldEst = updateEst
                ? undefined
                : this._est.get(getExprId(fb.uuid, ''))
            this._addExpr(fb, undefined, oldEst)
        }
        fb.sliceExprs.forEach((slice: SliceExpr): void => {
            const oldEst = updateEst
                ? undefined
                : this._est.get(getExprId(fb.uuid, slice.name))
            this._addExpr(fb, slice, oldEst)
        })
    }

    private _cellManager = new CellManager()
    // tslint:disable-next-line: readonly-array
    private _depsManager = new DepsManager()

    // tslint:disable-next-line: readonly-array
    private _est = new Map<string, Readonly<Est>>()
    private _errorManager = new ErrorManager()

    private _addExpr(
        fb: Readonly<FormulaBearer>,
        slice?: SliceExpr,
        oldEst?: Readonly<Est>,
    ): void {
        const digest = buildExprDigest(fb, slice, oldEst)
        if (!isExprDigest(digest)) {
            this._errorManager.setError(fb.uuid, digest)
            return
        }
        this._errorManager.checkEst(fb.uuid, digest.est)
        this._depsManager.setDeps(digest.fbInNodes, fb.uuid, slice?.name)
        const exprId = getExprId(fb.uuid, slice?.name ?? '')
        this._est.set(exprId, digest.est)
        this._cellManager.setCells(fb.uuid, digest.cells, slice?.name)
    }

    private _clear(): void {
        this._cellManager = new CellManager()
        this._est = new Map<string, Readonly<Est>>()
        this._depsManager = new DepsManager()
        this._errorManager = new ErrorManager()
    }

    private _clearFb(fb: Readonly<FormulaBearer>): void {
        this._cellManager.clearFb(fb)
        this._depsManager.clearFb(fb.uuid)
        this._errorManager.clearFb(fb.uuid)
    }
}

export function getExprId(fbId: string, slice: string): string {
    return `${fbId}-${slice}`
}
