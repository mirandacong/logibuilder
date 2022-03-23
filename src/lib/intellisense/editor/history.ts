import {HandleResult, HandleResultBuilder} from './handlers'
import {INVALID_STATUS, Status, StatusBuilder} from './status/entry'
import {PanelStatusBuilder} from './status/panel'

export class History {
    // tslint:disable-next-line: readonly-array
    protected undoStack: Readonly<Status>[] = []
    // tslint:disable-next-line: readonly-array
    protected redoStack: Readonly<Status>[] = []
    protected statusBuffer: Status = INVALID_STATUS

    protected addStatusBuffer(s: Status): void {
        if (this.statusBuffer !== INVALID_STATUS) {
            this.undoStack.push(this.statusBuffer)
            this.redoStack = []
        }
        const status = new StatusBuilder(s)
            .panelStatus(new PanelStatusBuilder(s.panelStatus)
                .page(s.panelStatus.page.slice())
                .build())
            .build()
        this.statusBuffer = status
    }

    protected resetStacks(s: Status = INVALID_STATUS): void {
        this.statusBuffer = s
        this.undoStack = []
        this.redoStack = []
    }

    protected textRedo(res: HandleResult): HandleResult | undefined {
        const txt = this.redoStack.pop()
        if (txt === undefined)
            return
        const currTxt = this.statusBuffer
        if (currTxt !== INVALID_STATUS)
            this.undoStack.push(currTxt)
        this.statusBuffer = txt
        const newStatus = new StatusBuilder(this.statusBuffer).build()
        return new HandleResultBuilder(res).newStatus(newStatus).build()
    }

    protected textUndo(res: HandleResult): HandleResult | undefined {
        const txt = this.undoStack.pop()
        if (txt === undefined)
            return
        const currTxt = this.statusBuffer
        if (currTxt !== INVALID_STATUS)
            this.redoStack.push(currTxt)
        this.statusBuffer = txt
        const newStatus = new StatusBuilder(this.statusBuffer).build()
        return new HandleResultBuilder(res).newStatus(newStatus).build()
    }
}
