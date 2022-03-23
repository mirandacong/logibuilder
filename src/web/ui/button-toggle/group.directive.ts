import {SelectionModel} from '@angular/cdk/collections'
import {
    ContentChildren,
    Directive,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    QueryList,
} from '@angular/core'

import {LogiButtonToggleComponent} from './button.component'

// tslint:disable: unknown-instead-of-any
@Directive({
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'logi-button-toggle-group',
    },
    // tslint:disable-next-line: directive-selector
    selector: 'logi-button-toggle-group',
})
export class LogiButtonToggleGroupDirective<T> implements OnInit {
    @Input() public set value(value: any) {
        this._setSelectionByValue(value)
    }

    public get value(): any {
        return this.selected ? this.selected.value : undefined
    }

    @Output() public readonly valueChange$ = new EventEmitter<T>()

    public get selected(): LogiButtonToggleComponent<T> {
        const selected: LogiButtonToggleComponent<T>[] = this._selectionModel ?
            this._selectionModel.selected : []
        return selected[0]
    }

    public ngOnInit(): void {
        this._selectionModel = new SelectionModel(false, undefined, false)
    }

    public isPreselected(button: LogiButtonToggleComponent<T>): boolean {
        if (this._rawValue === undefined)
            return false
        return button.value === this._rawValue
    }

    public syncButtonToggle(
        button: LogiButtonToggleComponent<T>,
        selected: boolean,
        isUserInput = false,
    ): void {
        if (this.selected && !button.selected)
            this.selected.selected = false
        const model = this._selectionModel
        if (model)
            selected ? model.select(button) : model.deselect(button)
        this._emitChange(isUserInput)
    }

    public isSelected(button: LogiButtonToggleComponent<T>): boolean {
        return this._selectionModel && this._selectionModel.isSelected(button)
    }

    /**
     * Use forwardRef here to avoid runtime error in release environment.
     * See https://github.com/angular/angular-cli/issues/14247
     */
    // tslint:disable-next-line: no-forward-ref
    @ContentChildren(forwardRef(() => LogiButtonToggleComponent))
    private readonly _buttons!: QueryList<LogiButtonToggleComponent<T>>
    private _selectionModel!: SelectionModel<LogiButtonToggleComponent<T>>
    private _rawValue?: any

    private _setSelectionByValue(value: any): void {
        this._rawValue = value
        if (!this._buttons)
            return
        this._clearSelection()
        this._selectValue(value)
    }

    private _clearSelection(): void {
        this._selectionModel.clear()
        this._buttons.forEach(button => button.selected = false)
    }

    private _selectValue(value: any): void {
        const button = this._buttons.find(b => b.value !== undefined
            && b.value === value)
        if (button === undefined)
            return
        button.selected = true
        this._selectionModel.select(button)
    }

    private _emitChange(isUserInput: boolean): void {
        if (isUserInput)
            this.valueChange$.emit(this.value)
    }
}
