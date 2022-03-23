import {Pipe, PipeTransform} from '@angular/core'
import {Frequency as FrequencyEnum} from '@logi/src/lib/template'

@Pipe({name: 'pickerTitle'})
export class PickerTitle implements PipeTransform {
    // tslint:disable-next-line: prefer-function-over-method
    public transform(value: FrequencyEnum): string {
        switch (value) {
        case FrequencyEnum.YEAR:
            return '年度范围'
        case FrequencyEnum.HALF_YEAR:
            return '半年度范围'
        case FrequencyEnum.QUARTER:
            return '季度范围'
        case FrequencyEnum.MONTH:
            return '月份范围'
        default:
            return ''
        }
    }
}
