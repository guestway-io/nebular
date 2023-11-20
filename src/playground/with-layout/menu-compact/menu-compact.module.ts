import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbMenuCompactModule } from '@nebular/theme';
import { MenuCompactRoutingModule } from './menu-compact-routing.module';
import { MenuCompactChildrenComponent } from './menu-compact-children.component';
import { MenuCompactShowcaseComponent } from './menu-compact-showcase.component';
import { MenuCompactAutoCollapseComponent } from './menu-compact-autocollapse.component';
import { MenuCompactLinkParamsComponent } from './menu-compact-link-params.component';
import {
  MenuCompactServiceItem1Component,
  MenuCompactServiceItem2Component,
  MenuCompactServiceItem3Component,
  MenuCompactServiceItem31Component,
  MenuCompactServiceItem32Component,
  MenuCompactServiceItem33Component,
  MenuCompactServiceItem331Component,
  MenuCompactServiceItem332Component,
} from './menu-compact-service-children';
import { MenuCompactServiceComponent } from './menu-compact-service.component';
import { MenuCompactBadgeComponent } from './menu-compact-badge.component';

@NgModule({
  declarations: [
    MenuCompactChildrenComponent,
    MenuCompactShowcaseComponent,
    MenuCompactAutoCollapseComponent,
    MenuCompactLinkParamsComponent,
    MenuCompactServiceItem1Component,
    MenuCompactServiceItem2Component,
    MenuCompactServiceItem3Component,
    MenuCompactServiceItem31Component,
    MenuCompactServiceItem32Component,
    MenuCompactServiceItem33Component,
    MenuCompactServiceItem331Component,
    MenuCompactServiceItem332Component,
    MenuCompactServiceComponent,
    MenuCompactBadgeComponent,
  ],
  imports: [NbMenuCompactModule.forRoot(), NbCardModule, MenuCompactRoutingModule, NbButtonModule],
})
export class MenuCompactModule {}
