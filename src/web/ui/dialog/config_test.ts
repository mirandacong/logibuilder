import {
    DialogConfigBuilder,
    getDefaultDialogConfig,
    MatDialogConfig,
    ConfirmDialogConfig,
} from './config'

describe('dialog config builder test', (): void => {
    it('default config', (): void => {
        const builder = new DialogConfigBuilder()
        const config = builder.build()
        expect(config).toEqual(getDefaultDialogConfig())
        const rebuild = () => {
            builder.build()
        }
        expect(rebuild).toThrow()
    })

    it('custom config', (): void => {
        const defaultConfig = new DialogConfigBuilder().build()
        expect(defaultConfig.autoFocus).toBe(false)
        const custom: MatDialogConfig = {
            autoFocus: true,
        }
        const customConfig = new DialogConfigBuilder(custom).build()
        expect(customConfig.autoFocus).toBe(true)
    })

    it('with data', (): void => {
        const data = {name: 'test'}
        const config = new DialogConfigBuilder().data(data).build()
        expect(config.data).toBe(data)
    })

    it('confirm dialog config test', () => {
        const config1 = new ConfirmDialogConfig()
        expect(config1.disableClose).toBe(false)
        const custom: MatDialogConfig = {
            disableClose: true,
            width: '100px',
        }
        const config2 = new ConfirmDialogConfig(custom)
        expect(config2.disableClose).toBe(true)
        expect(config2.width).toBe('100px')
    })
})
