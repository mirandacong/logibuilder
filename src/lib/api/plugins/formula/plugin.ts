import {
    SetFormulaManagerPayload,
    SetFormulaPayload,
} from '@logi/src/lib/api/payloads'
import {FormulaManager} from '@logi/src/lib/formula'
import {Subject} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {FormBuilder} from '../form'

import {FormulaResult, FormulaResultBuilder} from './result'

export class Plugin extends Base<FormulaResult> {
    public type = PluginType.FORMULA
    public result$ = new Subject<FormulaResult>()

    public formulaManager = new FormulaManager([])

    public handle(input: Readonly<Product>): void {
        this._changed = false
        this.handlePayloads(input)
        if (!this._changed)
            return
        input.addChanged(this.type)
        const result = new FormulaResultBuilder()
            .actionType(input.actionType)
            .formulaManager(this.formulaManager)
            .build()
        this.result$.next(result)
    }

    public setFormulaPayload(p: SetFormulaPayload): void {
        this.formulaManager.setFormula(p.row, p.col, p.formula)
        this._changed = true
    }

    public setFormulaManagerPayload(p: SetFormulaManagerPayload): void {
        this.formulaManager = p.formulaManager
        this._changed = true
    }

    private _changed = false
}

export const FORMULA_FORM = new FormBuilder()
    .type(PluginType.FORMULA)
    .deps([])
    .ctor(Plugin)
    .build()
