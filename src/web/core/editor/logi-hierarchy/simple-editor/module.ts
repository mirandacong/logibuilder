import {NgModule} from '@angular/core'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'

import {SimpleEditorComponent} from './component'
import {SuggestionPanelModule} from './suggestion-panel'
// TODO (kai): Understand why export here.
export {SimpleEditorComponent}

@NgModule({
    declarations: [SimpleEditorComponent],
    exports: [SimpleEditorComponent],
    imports: [
        NodeFocusableModule,
        SuggestionPanelModule,
    ],
})
export class SimpleEditorModule {}
