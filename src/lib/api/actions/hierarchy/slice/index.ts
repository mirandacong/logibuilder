// tslint:disable-next-line: limit-for-build-index
export {
    Action as AddSliceAction,
    ActionBuilder as AddSliceActionBuilder,
} from './add_slice'
export {
    Action as BatchAddSlicesAction,
    ActionBuilder as BatchAddSlicesActionBuilder,
} from './batch_add_slices'
export {
    Action as MoveSliceVertically,
    ActionBuilder as MoveSliceVerticallyBuilder,
} from './move_vertically'
export {
    Action as PasteSliceAction,
    ActionBuilder as PasteSliceActionBuilder,
} from './paste'
export {
    Action as RemoveAllSlicesAction,
    ActionBuilder as RemoveAllSlicesActionBuilder,
} from './remove_all'
export {
    Action as RemoveSliceDbDataAction,
    ActionBuilder as RemoveSliceDbDataActionBuilder,
} from './remove_db_data'
export {
    Action as RemoveSliceAction,
    ActionBuilder as RemoveSliceActionBuilder,
} from './remove_slice'
export {
    Action as SetSliceExprAction,
    ActionBuilder as SetSliceExprActionBuilder,
} from './set_expr'
export {
    Action as SetSliceNameAction,
    ActionBuilder as SetSliceNameActionBuilder,
} from './set_name'
export {
    Action as SetSliceTypeAction,
    ActionBuilder as SetSliceTypeBuilder,
    isAction as isSliceType,
} from './set_type'
