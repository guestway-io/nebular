import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbMenuItemCompact } from '@nebular/theme';

@Component({
  selector: 'npg-menu-compact-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-compact-showcase.component.html',
})
export class MenuCompactShowcaseComponent {
  items: NbMenuItemCompact[] = [
    {
      title: 'Profile',
      icon: 'person-outline',
      level: 0,
    },
    {
      title: 'Change Password',
      icon: 'lock-outline',
      level: 0,
    },
    {
      title: 'Privacy Policy',
      icon: { icon: 'checkmark-outline', pack: 'eva' },
      level: 0,
    },
    {
      title: 'Logout',
      icon: 'unlock-outline',
      level: 0,
    },
  ];
}
