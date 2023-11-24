import { ModuleWithProviders, NgModule } from '@angular/core';
import { NbSharedModule } from '../shared/shared.module';
import { NbIconModule } from '../icon/icon.module';
import { NbBadgeModule } from '../badge/badge.module';
import { NbMenuCompactComponent } from './menu-compact.component';
import { NbMenuCompactInternalService, NbMenuCompactService } from './menu-compact.service';
import { NbMenuItemCompactComponent } from './menu-item-compact.component';

const nbMenuComponents = [NbMenuCompactComponent, NbMenuItemCompactComponent];

const NB_MENU_PROVIDERS = [NbMenuCompactService, NbMenuCompactInternalService];

@NgModule({
  imports: [NbSharedModule, NbIconModule, NbBadgeModule],
  declarations: [...nbMenuComponents],
  exports: [...nbMenuComponents],
})
export class NbMenuCompactModule {
  static forRoot(): ModuleWithProviders<NbMenuCompactModule> {
    return {
      ngModule: NbMenuCompactModule,
      providers: [...NB_MENU_PROVIDERS],
    };
  }
}
