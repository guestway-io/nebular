import { NgModule, ModuleWithProviders } from '@angular/core';

import { NbSharedModule } from '../shared/shared.module';
import { NbMenuCompactComponent, NbMenuItemCompactComponent } from './menu-compact.component';
import { NbMenuCompactService, NbMenuCompactInternalService } from './menu-compact.service';
import { NbIconModule } from '../icon/icon.module';
import { NbBadgeModule } from '../badge/badge.module';

const nbMenuCompactComponents = [NbMenuCompactComponent, NbMenuItemCompactComponent];

const NB_MENU_COMPACT_PROVIDERS = [NbMenuCompactService, NbMenuCompactInternalService];

@NgModule({
  imports: [NbSharedModule, NbIconModule, NbBadgeModule],
  declarations: [...nbMenuCompactComponents],
  exports: [...nbMenuCompactComponents],
})
export class NbMenuCompactModule {
  static forRoot(): ModuleWithProviders<NbMenuCompactModule> {
    return {
      ngModule: NbMenuCompactModule,
      providers: [...NB_MENU_COMPACT_PROVIDERS],
    };
  }
}
