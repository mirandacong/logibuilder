import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core'

// tslint:disable: readonly-keyword
export interface SliderTrackStyle {
    bottom?: string | null
    height?: string | null
    left?: string | null
    width?: string | null
    visibility?: string
}

// tslint:disable: codelyzer-template-property-should-be-public
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    selector: 'logi-slider-track',
    styleUrls: ['./track.style.scss'],
    templateUrl: './track.template.html',
})
export class LogiSliderTrackComponent implements OnChanges {
    @Input() public offset = 0
    @Input() public reverse = false
    @Input() public length = 0
    @Input() public vertical = false
    @Input() public included = false
    // tslint:disable-next-line: unknown-instead-of-any no-indexable-types
    public style: SliderTrackStyle = {}

    public ngOnChanges(): void {
        const vertical = this.vertical
        const reverse = this.reverse
        const visibility = this.included ? 'visible' : 'hidden'
        const offset = this.offset
        const length = this.length

        const positonStyle: SliderTrackStyle = vertical
      ? {
          [reverse ? 'top' : 'bottom']: `${offset}%`,
          [reverse ? 'bottom' : 'top']: 'auto',
          height: `${length}%`,
          visibility,
      }
      : {
          [reverse ? 'right' : 'left']: `${offset}%`,
          [reverse ? 'left' : 'right']: 'auto',
          visibility,
          width: `${length}%`,
      }

        this.style = positonStyle
    }
}
