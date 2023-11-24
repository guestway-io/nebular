import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbMenuItemCompact } from '@nebular/theme';

@Component({
  selector: 'npg-menu-badge-compact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-compact-badge.component.html',
  styleUrls: ['./menu-compact-badge.component.scss'],
})
export class MenuCompactBadgeComponent {
  items: NbMenuItemCompact[] = [
    {
      title: 'Profile',
      expanded: true,
      badge: {
        text: '30',
        status: 'primary',
      },
      level: 0,
      icon: 'person-outline',
      children: [
        {
          title: 'Messages',
          badge: {
            text: '99+',
            status: 'danger',
          },
          level: 1,
        },
        {
          title: 'Notifications',
          badge: {
            dotMode: true,
            status: 'warning',
          },
          level: 1,
        },
        {
          title: 'Emails',
          badge: {
            text: 'new',
            status: 'success',
          },
          level: 1,
        },
      ],
    },
    {
      title: 'Shopping bag',
      level: 0,
      icon: 'shopping-bag-outline',
    },
  ];
}
