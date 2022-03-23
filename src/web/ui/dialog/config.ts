import {MatDialogConfig} from '@angular/material/dialog'
import {assertIsDefined} from '@logi/base/ts/common/assert'
import {Builder} from '@logi/base/ts/common/builder'

export {MatDialogConfig}

/**
 * Default material dialog config options for logi.
 */
export function getDefaultDialogConfig(): MatDialogConfig {
    return {
        autoFocus: false,
        disableClose: true,
        width: '540px',
    }
}

/**
 * Dialog config builder used to build a custom dialog config.
 */
export class DialogConfigBuilder<D> {
    public constructor(config?: MatDialogConfig) {
        this._config = getDefaultDialogConfig()
        if (config !== undefined)
            Builder.shallowCopy(this._config, config)
    }

    public data(data: D): this {
        if (this._config !== undefined)
            this._config.data = data
        return this
    }

    public build(): MatDialogConfig<D> {
        const config = this._config
        this._config = undefined
        assertIsDefined<MatDialogConfig>(config)
        return config
    }

    private _config?: MatDialogConfig<D>
}

/**
 * 确认性质的文本对话框配置
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ConfirmDialogConfig<D = any> extends MatDialogConfig<D> {
    public constructor(custom?: MatDialogConfig) {
        super()
        // tslint:disable-next-line: no-object
        Object.assign(this, custom)
    }
    // 确认对话框需要默认支持 Enter/Esc 快捷键， disableClose为false
    public disableClose = false
    public autoFocus = true
    public width = '540px'
}
