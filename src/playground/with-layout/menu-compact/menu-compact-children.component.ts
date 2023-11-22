/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbMenuItemCompact } from '@nebular/theme';

@Component({
  selector: 'npg-menu-compact-children',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-compact-children.component.html',
})
export class MenuCompactChildrenComponent {
  items: NbMenuItemCompact[] = [
    {
      title: 'Profile',
      expanded: true,
      level: 0,
      icon: 'person-outline',
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
      icon: 'shopping-bag-outline',
      level: 0,
    },
    {
      title: 'Orders',
      icon: 'shopping-cart-outline',
      level: 0,
    },
  ];
}
