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
      children: [
        {
          title: 'Change Password',
          icon: 'person-outline',
        },
        {
          title: 'Privacy Policy',
          icon: 'person-outline',
        },
        {
          title: 'Logout',
          icon: 'person-outline',
        },
      ],
    },
    {
      title: 'Shopping Bag',
      ariaRole: 'button',
      icon: 'shopping-bag-outline',
      children: [
        {
          title: 'First Product',
        },
        {
          title: 'Second Product',
        },
        {
          title: 'Third Product',
        },
      ],
    },
    {
      title: 'Orders',
      ariaRole: 'button',
      icon: 'shopping-cart-outline',
      children: [
        {
          title: 'First Order',
        },
        {
          title: 'Second Order',
        },
        {
          title: 'Third Order',
        },
      ],
    },
  ];
}
