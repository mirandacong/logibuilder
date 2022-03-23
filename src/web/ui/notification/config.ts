import {MatSnackBarConfig} from '@angular/material/snack-bar'
import {assertIsDefined} from '@logi/base/ts/common/assert'
import {Builder} from '@logi/base/ts/common/builder'

export {MatSnackBarConfig}

/**
 * Default material snackbar config options for logi.
 */
export function getDefaultSnackBarConfig(): MatSnackBarConfig {
    return {
        duration: 5000,
        horizontalPosition: 'center',
        panelClass: 'logi-notification',
        verticalPosition: 'top',
    }
}

export class SnackBarConfigBuilder<D> {
    public constructor(config?: MatSnackBarConfig) {
        this._config = getDefaultSnackBarConfig()
        if (config !== undefined)
            Builder.shallowCopy(this._config, config)
    }

    public data(data: D): this {
        if (this._config !== undefined)
            this._config.data = data
        return this
    }

    public build(): MatSnackBarConfig<D> {
        const config = this._config
        this._config = undefined
        assertIsDefined<MatSnackBarConfig>(config)
        return config
    }

    private _config?: MatSnackBarConfig<D>
}
