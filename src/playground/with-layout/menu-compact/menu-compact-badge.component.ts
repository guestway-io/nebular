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
      icon: 'person-outline',
      children: [
        {
          title: 'Messages',
          badge: {
            text: '99+',
            status: 'danger',
          },
        },
        {
          title: 'Notifications',
          badge: {
            dotMode: true,
            status: 'warning',
          },
        },
        {
          title: 'Emails',
          badge: {
            text: 'new',
            status: 'success',
          },
        },
      ],
    },
    {
      title: 'Shopping bag',
      icon: 'shopping-bag-outline',
    },
  ];
}
