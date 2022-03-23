import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './web';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
