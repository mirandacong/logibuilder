import {ComponentType} from '@angular/cdk/portal'
import {Injectable, OnDestroy, TemplateRef} from '@angular/core'
import {MatDialog, MatDialogRef} from '@angular/material/dialog'
import {Subscription} from 'rxjs'

import {
    DialogConfigBuilder,
    MatDialogConfig,
    ConfirmDialogConfig,
} from './config'
import {
    InputDialogData,
    plainConfirmDialogData,
    plainPromptDialogData,
    TextDialogData,
} from './dialog_data'
import {InputDialogComponent} from './input.component'
import {TextDialogComponent} from './text.component'

@Injectable()
export class DialogService implements OnDestroy {
    public constructor(private readonly _dialog: MatDialog) {}

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    /**
     * open material dialog
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public open<T, D = any, R = any>(
        componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
        config?: MatDialogConfig<D>,
    ): MatDialogRef<T, R> {
        const dialogConfig = new DialogConfigBuilder<TextDialogData>(config)
            .build()
        return this._dialog.open(componentOrTemplateRef, dialogConfig)
    }

    public openConfirmDialog(
        title: string,
        content: string,
        customConfig?: MatDialogConfig,
    ): MatDialogRef<TextDialogComponent, boolean> {
        const data = plainConfirmDialogData(title, content)
        const config = new ConfirmDialogConfig(customConfig)
        config.data = data
        return this._dialog.open<TextDialogComponent, TextDialogData>(
            TextDialogComponent,
            config,
        )
    }

    public openPromptDialog(
        title: string,
        content: string,
        customConfig?: MatDialogConfig,
    ): MatDialogRef<TextDialogComponent, boolean> {
        const data = plainPromptDialogData(title, content)
        const config = new ConfirmDialogConfig(customConfig)
        config.data = data
        return this._dialog.open<TextDialogComponent, TextDialogData>(
            TextDialogComponent,
            config,
        )
    }

    /**
     * Open a text content dialog.
     */
    public openTextDialog<T = unknown>(
        data: TextDialogData,
        config?: MatDialogConfig,
    ): MatDialogRef<TextDialogComponent, T> {
        const dialogConfig = new DialogConfigBuilder<TextDialogData>(config)
            .data(data)
            .build()
        return this._dialog.open<TextDialogComponent, TextDialogData>(
            TextDialogComponent,
            dialogConfig,
        )
    }

    public openInputDialog(
        data: InputDialogData,
        config?: MatDialogConfig,
    ): MatDialogRef<InputDialogComponent, unknown> {
        const dialogConfig = new DialogConfigBuilder<InputDialogData>(config)
            .data(data)
            .build()
        return this._dialog.open<InputDialogComponent, InputDialogData>(
            InputDialogComponent,
            dialogConfig,
        )
    }

    private _subs = new Subscription()
}
