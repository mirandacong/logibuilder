import {Directive, Input, TemplateRef} from '@angular/core'

// tslint:disable-next-line: directive-selector
@Directive({selector: 'ng-template[colDef]'})
export class ColumnDefDirective<C> {
    public constructor(public readonly templateRef: TemplateRef<C>) {}
    @Input() public column!: string
}
