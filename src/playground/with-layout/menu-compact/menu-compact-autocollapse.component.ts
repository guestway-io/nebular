import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbMenuItemCompact } from '@nebular/theme';

@Component({
  selector: 'npg-menu-compact-autocollapse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-compact-autocollapse.component.html',
})
export class MenuCompactAutoCollapseComponent {
  items: NbMenuItemCompact[] = [
    {
      title: 'Profile',
      expanded: true,
      ariaRole: 'button',
      icon: 'person-outline',
      level: 0,
      children: [
        {
          title: 'Change Password',
          icon: 'person-outline',
          level: 1,
        },
        {
          title: 'Privacy Policy',
          icon: 'person-outline',
          level: 1,
        },
        {
          title: 'Logout',
          icon: 'person-outline',
          level: 1,
        },
      ],
    },
    {
      title: 'Shopping Bag',
      ariaRole: 'button',
      level: 0,
      icon: 'shopping-bag-outline',
      children: [
        {
          title: 'First Product',
          level: 1,
        },
        {
          title: 'Second Product',
          level: 1,
        },
        {
          title: 'Third Product',
          level: 1,
        },
      ],
    },
    {
      title: 'Orders',
      ariaRole: 'button',
      level: 0,
      icon: 'shopping-cart-outline',
      children: [
        {
          title: 'First Order',
          level: 1,
        },
        {
          title: 'Second Order',
          level: 1,
        },
        {
          title: 'Third Order',
          level: 1,
        },
      ],
    },
  ];
}
