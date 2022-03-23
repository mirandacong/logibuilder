import {debugTimer} from '@logi/base/ts/common/debug'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    isAddChildPayload,
    isSetAliasPayload,
    isSetNamePayload,
    Payload,
} from '@logi/src/lib/api/payloads'
import {
    ALL_TYPES,
    Book,
    getNodesVisitor,
    isBook,
    isRow,
    Node,
    NodeType,
    PathBuilder,
    resolve,
    Row,
} from '@logi/src/lib/hierarchy/core'

import {Replacement, ReplacementBuilder} from '../../lib/replacement'
import {shallowCopy, updateRoot} from '../../lib/utils'

export class ValidHandler {
    public invalidNodes = new Set<string>()
    @debugTimer('validation controller')
    public updateValid(
        book: Readonly<Book>,
        payloads: readonly Payload[],
    ): Readonly<Book> {
        this._setBook(book)
        this._handlePaylaod(payloads)
        return this._book
    }

    private _book!: Readonly<Book>
    private _bookMap = new Map<string, Readonly<Node>>()
    private _recordValid = new Map<string, boolean>()
    private _setBook(book: Readonly<Book>): void {
        this._book = book
        this._bookMap = new Map()
        this.invalidNodes = new Set<string>()
        const nodes = preOrderWalk(book, getNodesVisitor, ALL_TYPES)
        nodes.forEach((n: Readonly<Node>): void => {
            this._bookMap.set(n.uuid, n)
            if (isRow(n) && !n.valid && !n.separator)
                this.invalidNodes.add(n.uuid)
        })
    }

    private _handlePaylaod(payloads: readonly Payload[]): void {
        this._recordValid = new Map()
        payloads.forEach((p: Payload): void => {
            if (isSetNamePayload(p) || isSetAliasPayload(p))
                this._setValidation(p.uuid)
            else if (isAddChildPayload(p))
                this._setValidation(p.child.uuid)
        })
        this._reCalRelaInvalid()
        const reps: Replacement[] = []
        this._recordValid.forEach((valid: boolean, uuid: string): void => {
            const ori = this._bookMap.get(uuid)
            if (ori === undefined)
                return
            const substitute = shallowCopy(ori)
            if (!isRow(substitute))
                return
            // @ts-ignore
            substitute.valid = valid
            const r = new ReplacementBuilder()
                .original(ori)
                .substitute(substitute)
                .build()
            reps.push(r)
            if (valid)
                this.invalidNodes.delete(uuid)
            else this.invalidNodes.add(uuid)
        })
        const root = updateRoot(reps)
        if (!isBook(root))
            return
        this._book = root
    }

    private _setValidation(uuid: string): void {
        const node = this._bookMap.get(uuid)
        if (node === undefined)
            return
        const rows = preOrderWalk(
            node,
            getNodesVisitor,
            [NodeType.ROW],
        ).filter(isRow)
        rows.forEach((r: Readonly<Row>): void => {
            if (r.name === '' || r.separator)
                return
            const path = new PathBuilder(r.getPath()).alias(r.alias).build()
            const result = resolve(path, this._book)
            // tslint:disable-next-line: no-type-assertion
            if (result.length < 1 && !r.valid)
                this._recordValid.set(r.uuid, true)
            if (result.length > 1 && r.valid)
                this._recordValid.set(r.uuid, false)
        })
    }

    private _reCalRelaInvalid(): void {
        const rows: Readonly<Row>[] = []
        this.invalidNodes.forEach((uuid: string): void => {
            const r = this._bookMap.get(uuid)
            if (!isRow(r) || r.separator)
                return
            rows.push(r)
        })
        const samePath = new Set<string>()
        rows.forEach((r: Readonly<Row>): void => {
            const path = new PathBuilder(r.getPath()).alias(r.alias).build()
            const pathStr = path.toString()
            if (samePath.has(pathStr))
                return
            samePath.add(pathStr)
            if (this._recordValid.has(r.uuid))
                return
            const result = resolve(path, this._book)
            if (result.length !== 0)
                return
            this._recordValid.set(r.uuid, true)
        })
    }
}
