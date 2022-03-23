import {
    AddChildPayload,
    AddLabelPayload,
    AddSlicePayload,
    InitPayload,
    RedoPayload,
    RemoveAnnotationPayload,
    RemoveChildPayload,
    RemoveLabelPayload,
    RemoveSliceAnnotationPayload,
    RemoveSlicePayload,
    RenderPayload,
    SetAliasPayload,
    SetAnnotationPayload,
    SetBoldPayload,
    SetBookPayload,
    SetCurrencyPayload,
    SetDataTypePayload,
    SetDecimalPlacesPayload,
    SetExpressionPayload,
    SetFamilyPayload,
    SetHeaderStubPayload,
    SetIndentPayload,
    SetItalicPayload,
    SetLinePayload,
    SetModifierPayload,
    SetNamePayload,
    SetPercentPayload,
    SetRefHeaderPayload,
    SetSizePayload,
    SetSliceAnnotationPayload,
    SetSliceExprPayload,
    SetSliceNamePayload,
    SetSliceTypePayload,
    SetSourceManagerPayload,
    SetStdHeaderSetPayload,
    SetThousandsSeparatorPayload,
    SetTypePayload,
    UndoPayload,
} from '@logi/src/lib/api/payloads'

import {Product} from './base'

export interface HierarchyHandler {
    addChildPayload(p: AddChildPayload, input: Readonly<Product>): void
    addLabelPayload(p: AddLabelPayload, input: Readonly<Product>): void
    addSlicePayload(p: AddSlicePayload, input: Readonly<Product>): void
    removeChildPayload(p: RemoveChildPayload, input: Readonly<Product>): void
    removeLabelPayload(p: RemoveLabelPayload, input: Readonly<Product>): void
    removeSlicePayload(p: RemoveSlicePayload, input: Readonly<Product>): void
    setExpressionPayload(
        p: SetExpressionPayload,
        input: Readonly<Product>,
    ): void
    setHeaderStubPayload(
        p: SetHeaderStubPayload,
        input: Readonly<Product>,
    ): void
    setNamePayload(p: SetNamePayload, input: Readonly<Product>): void
    setDataTypePayload(p: SetDataTypePayload, input: Readonly<Product>): void
    setSliceExprPayload(p: SetSliceExprPayload, input: Readonly<Product>): void
    setSliceNamePayload(p: SetSliceNamePayload, input: Readonly<Product>): void
    setSliceTypePayload(p: SetSliceTypePayload, input: Readonly<Product>): void
    setTypePayload(p: SetTypePayload, input: Readonly<Product>): void
    setAliasPayload(p: SetAliasPayload, input: Readonly<Product>): void
    setRefHeaderPayload?(p: SetRefHeaderPayload, input: Readonly<Product>): void
    setAnnotationPayload?(
        p: SetAnnotationPayload,
        input: Readonly<Product>,
    ): void
    setSliceAnnotationPayload?(
        p: SetSliceAnnotationPayload,
        input: Readonly<Product>,
    ): void
    removeAnnotationPayload?(
        p: RemoveAnnotationPayload,
        input: Readonly<Product>,
    ): void
    removeSliceAnnotationPayload?(
        p: RemoveSliceAnnotationPayload,
        input: Readonly<Product>,
    ): void
}

export interface HistoryHandler {
    undoPayload(p: UndoPayload, input: Readonly<Product>): void
    redoPayload(p: RedoPayload, input: Readonly<Product>): void
}

export interface EditorHandler {
    initPayload(p: InitPayload, input: Readonly<Product>): void
    setBookPayload(p: SetBookPayload, input: Readonly<Product>): void
    setSourceManagerPayload(
        p: SetSourceManagerPayload,
        input: Readonly<Product>,
    ): void
    setStdHeaderSetPayload?(
        p: SetStdHeaderSetPayload,
        input: Readonly<Product>,
    ): void
}

export interface RenderHandler {
    renderPayload(p: RenderPayload, input: Readonly<Product>): void
}

export interface ModifierHandler {
    setBoldPayload(p: SetBoldPayload, input: Readonly<Product>): void
    setCurrencyPayload(p: SetCurrencyPayload, input: Readonly<Product>): void
    setDecimalPlacesPayload(
        p: SetDecimalPlacesPayload,
        input: Readonly<Product>,
    ): void
    setFamilyPayload(p: SetFamilyPayload, input: Readonly<Product>): void
    setIndentPayload(p: SetIndentPayload, input: Readonly<Product>): void
    setItalicPayload(p: SetItalicPayload, input: Readonly<Product>): void
    setLinePayload(p: SetLinePayload, input: Readonly<Product>): void
    setPercentPayload(p: SetPercentPayload, input: Readonly<Product>): void
    setSizePayload(p: SetSizePayload, input: Readonly<Product>): void
    setThousandsSeparatorPayload(
        p: SetThousandsSeparatorPayload,
        input: Readonly<Product>,
    ): void
    setModifierPayload(p: SetModifierPayload, input: Readonly<Product>): void
}
