import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbMenuItemCompact } from '@nebular/theme';

@Component({
  selector: 'npg-menu-compact-link-params',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-compact-link-params.component.html',
})
export class MenuCompactLinkParamsComponent {
  items: NbMenuItemCompact[] = [
    {
      title: 'Menu link with parameters',
      expanded: true,
      level: 0,
      icon: 'menu-2-outline',
      children: [
        {
          title: 'Goes into angular `routerLink`',
          link: '', // goes into angular `routerLink`
          level: 1,
        },
        {
          title: 'Goes directly into `href` attribute',
          url: '/example/menu/menu-link-params.component#some-location', // goes directly into `href` attribute
          level: 1,
        },
        {
          title: 'Menu item path match `prefix`',
          link: '/example/menu/menu-link-params.component',
          queryParams: { someUrlParam: 'true' },
          pathMatch: 'prefix',
          level: 1,
        },
        {
          title: 'Will be opened in new window (target=`_blank`)',
          url: 'https://github.com/akveo/nebular',
          target: '_blank',
          level: 1,
        },
        {
          title: 'Menu item with icon',
          link: '/example/menu/menu-link-params.component',
          icon: 'search-outline',
          level: 1,
        },
        {
          title: 'Hidden menu item',
          link: '',
          hidden: true,
          level: 1,
        },
      ],
    },
  ];
}
