import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import {
  MenuCompactItem1Component,
  MenuCompactItem2Component,
  MenuCompactItem31Component,
  MenuCompactItem32Component,
  MenuCompactItem331Component,
  MenuCompactItem332Component,
  MenuCompactItem33Component,
  MenuCompactItem3Component,
  MenuCompactItem4Component,
} from './components/menu-compact-children.component';
import { MenuCompactTestComponent } from './menu-compact-test.component';

const routes: Route[] = [
  {
    path: 'menu-compact-test.component',
    component: MenuCompactTestComponent,
    children: [
      {
        path: '',
        redirectTo: '1',
        pathMatch: 'full',
      },
      {
        path: '1',
        component: MenuCompactItem1Component,
      },
      {
        path: '2',
        component: MenuCompactItem2Component,
      },
      {
        path: '12',
        component: MenuCompactItem1Component,
      },
      {
        path: '3',
        component: MenuCompactItem3Component,
        children: [
          {
            path: '',
            redirectTo: '1',
            pathMatch: 'full',
          },
          {
            path: '1',
            component: MenuCompactItem31Component,
          },
          {
            path: '2',
            component: MenuCompactItem32Component,
          },
          {
            path: '3',
            component: MenuCompactItem33Component,
            children: [
              {
                path: '',
                redirectTo: '1',
                pathMatch: 'full',
              },
              {
                path: '1',
                component: MenuCompactItem331Component,
              },
              {
                path: '2',
                component: MenuCompactItem332Component,
              },
            ],
          },
        ],
      },
      {
        path: '4',
        component: MenuCompactItem4Component,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuCompactTestRoutingModule {}
