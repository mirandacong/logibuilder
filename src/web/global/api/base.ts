// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {
    Action,
    handleAction,
    Notice,
    RenderService,
    Result,
} from '@logi/src/lib/api'
import {ExprManager} from '@logi/src/lib/dsl/semantic'
import {Book, Node} from '@logi/src/lib/hierarchy/core'
import {HsfManager} from '@logi/src/lib/hsf'
import {TemplateSet} from '@logi/src/lib/template'
import {Observable} from 'rxjs'
import {filter} from 'rxjs/operators'

export abstract class BaseApiService {
    public currBook(): Readonly<Book> {
        return this.api.book
    }

    public currTemplateSet(): Readonly<TemplateSet> {
        return this.api.templateSet
    }

    public getHsfManager(): HsfManager {
        return this.api.hsfManager
    }

    public getExprManager(): ExprManager {
        return this.api.exprManager
    }

    public workbook(): GC.Spread.Sheets.Workbook {
        return this.api.excel
    }

    public getBookMap(): Map<string, Readonly<Node>> {
        return this.api.bookMap
    }

    public handleAction(action: Action): Observable<boolean> {
        return handleAction(action, this.api)
    }

    public noticeEmitter(): Observable<Notice> {
        return this.api.getEmitters().noticeEmitter
    }

    public hierarchyChange(): Observable<Result> {
        return this.api.getEmitters().bookEmitter
            .pipe(filter(r => r !== undefined && r.actionType > 0))
    }

    public excelChange(): Observable<Result> {
        return this.api.getEmitters().excelEmitter
    }

    protected abstract api: RenderService
}
