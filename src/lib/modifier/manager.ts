import {History} from '@logi/base/ts/common/history'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {Book, getNodesVisitor, NodeType} from '@logi/src/lib/hierarchy/core'

import {Modifier, ModifierBuilder} from './base'

export class Manager extends History {
    public constructor(modifiers: readonly Modifier[]) {
        super()
        modifiers.forEach((m: Modifier): void => {
            this._modifiers.set(m.uuid, m)
        })
    }
    public getModifier(row: string): Modifier | undefined {
        return this._modifiers.get(row)
    }

    public buildModifier(row: string): Modifier {
        let mod = this._modifiers.get(row)
        if (mod === undefined) {
            mod = new ModifierBuilder().uuid(row).build()
            this._modifiers.set(row, mod)
        }
        return mod
    }

    public getModifers(): readonly Modifier[] {
        return Array.from(this._modifiers.values())
    }

    public gc(book: Readonly<Book>): void {
        const rows = preOrderWalk(book, getNodesVisitor, [NodeType.ROW])
            .map(n => n.uuid)
        const set = new Set<string>(rows)
        this._modifiers.forEach((m: Modifier): void => {
            if (!set.has(m.uuid))
                this._modifiers.delete(m.uuid)
        })
    }

    private _modifiers = new Map<string, Modifier>()
}
