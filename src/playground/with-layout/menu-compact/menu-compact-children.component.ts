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
      icon: 'shopping-bag-outline',
    },
    {
      title: 'Orders',
      icon: 'shopping-cart-outline',
    },
  ];
}
