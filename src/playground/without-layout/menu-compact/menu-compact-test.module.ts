import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbLayoutModule, NbMenuCompactModule, NbSidebarModule } from '@nebular/theme';
import { MenuCompactTestRoutingModule } from './menu-compact-test-routing.module';
import { MenuCompactTestComponent } from './menu-compact-test.component';
import {
  MenuCompactItem1Component,
  MenuCompactItem2Component,
  MenuCompactItem3Component,
  MenuCompactItem31Component,
  MenuCompactItem32Component,
  MenuCompactItem33Component,
  MenuCompactItem331Component,
  MenuCompactItem332Component,
  MenuCompactItem4Component,
} from './components/menu-compact-children.component';

@NgModule({
  declarations: [
    MenuCompactTestComponent,
    MenuCompactItem1Component,
    MenuCompactItem2Component,
    MenuCompactItem3Component,
    MenuCompactItem31Component,
    MenuCompactItem32Component,
    MenuCompactItem33Component,
    MenuCompactItem331Component,
    MenuCompactItem332Component,
    MenuCompactItem4Component,
  ],
  imports: [
    NbMenuCompactModule.forRoot(),
    NbLayoutModule,
    NbSidebarModule.forRoot(),
    NbCardModule,
    MenuCompactTestRoutingModule,
    NbButtonModule,
  ],
})
export class MenuCompactTestModule {}
