import {Container} from 'inversify'

import {BuilderService, BuilderServiceImpl} from './builder'
import {ProjectService, ProjectServiceImpl} from './project'
import {TemplateService, TemplateServiceImpl} from './template'
import {
    BUILDER_SERVICE_TYPE,
    PROJECT_SERVICE_TYPE,
    TEMPLATE_SERVICE_TYPE,
} from './types'

/**
 * TODO(zengkai): Do not export container directly here.
 */
export const CONTAINER = new Container()
CONTAINER.bind<BuilderService>(BUILDER_SERVICE_TYPE).to(BuilderServiceImpl)
CONTAINER.bind<ProjectService>(PROJECT_SERVICE_TYPE).to(ProjectServiceImpl)
CONTAINER.bind<TemplateService>(TEMPLATE_SERVICE_TYPE).to(TemplateServiceImpl)
