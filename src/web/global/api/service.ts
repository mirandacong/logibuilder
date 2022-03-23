import {Injectable} from '@angular/core'
import {
    BuilderService,
    BUILDER_SERVICE_TYPE,
    CONTAINER,
} from '@logi/src/lib/api'
import {Model, ModelBuilder} from '@logi/src/lib/model'

import {FxApiService} from './fx.service'

@Injectable()
export class StudioApiService extends FxApiService {
    // tslint:disable-next-line: no-unnecessary-method-declaration
    public model(): Model {
        return new ModelBuilder()
            .book(this.api.book)
            .formulaManager(this.api.formulaManager)
            .modifierManager(this.api.modifierManager)
            .sourceManager(this.api.sourceManager)
            .build()
    }

    protected api = CONTAINER.get<BuilderService>(BUILDER_SERVICE_TYPE)
}
