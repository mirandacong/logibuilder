import {DirectiveResponse} from './directive'
import {FuncHelperResponse} from './func_helper'
import {PanelResponse} from './panel/response'
import {EditorResponse} from './textbox/response'

export type DisplayResponse = PanelResponse | EditorResponse
    | DirectiveResponse | FuncHelperResponse
