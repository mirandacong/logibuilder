import {Component, Input} from '@angular/core'

/**
 * For mock mat-icon selecor.
 * See: https://stackoverflow.com/questions/55472255/how-do-i-add-svg-files-via-maticonregistry-in-unit-tests
 */
@Component({
    // tslint:disable-next-line: component-selector
    selector: 'mat-icon',
    template: '<span></span>',
})
export class IconComponent {
    @Input() public svgIcon: unknown
    @Input() public fontSet: unknown
    @Input() public fontIcon: unknown
}
