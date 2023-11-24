import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { MenuCompactChildrenComponent } from './menu-compact-children.component';
import { MenuCompactShowcaseComponent } from './menu-compact-showcase.component';
import { MenuCompactAutoCollapseComponent } from './menu-compact-autocollapse.component';
import { MenuCompactLinkParamsComponent } from './menu-compact-link-params.component';
import {
  MenuCompactServiceItem1Component,
  MenuCompactServiceItem2Component,
  MenuCompactServiceItem31Component,
  MenuCompactServiceItem32Component,
  MenuCompactServiceItem331Component,
  MenuCompactServiceItem332Component,
  MenuCompactServiceItem33Component,
  MenuCompactServiceItem3Component,
} from './menu-compact-service-children';
import { MenuCompactServiceComponent } from './menu-compact-service.component';
import { MenuCompactBadgeComponent } from './menu-compact-badge.component';

const routes: Route[] = [
  {
    path: 'menu-compact-children.component',
    component: MenuCompactChildrenComponent,
  },
  {
    path: 'menu-compact-showcase.component',
    component: MenuCompactShowcaseComponent,
  },
  {
    path: 'menu-compact-autocollapse.component',
    component: MenuCompactAutoCollapseComponent,
  },
  {
    path: 'menu-compact-link-params.component',
    component: MenuCompactLinkParamsComponent,
  },
  {
    path: 'menu-compact-badge.component',
    component: MenuCompactBadgeComponent,
  },
  {
    path: 'menu-compact-service.component',
    component: MenuCompactServiceComponent,
    children: [
      {
        path: '2',
        component: MenuCompactServiceItem2Component,
      },
      {
        path: '3',
        component: MenuCompactServiceItem3Component,
        children: [
          {
            path: '1',
            component: MenuCompactServiceItem31Component,
          },
          {
            path: '2',
            component: MenuCompactServiceItem32Component,
          },
          {
            path: '3',
            component: MenuCompactServiceItem33Component,
            children: [
              {
                path: '1',
                component: MenuCompactServiceItem331Component,
              },
              {
                path: '2',
                component: MenuCompactServiceItem332Component,
              },
            ],
          },
        ],
      },
      {
        path: '',
        component: MenuCompactServiceItem1Component,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuCompactRoutingModule {}
