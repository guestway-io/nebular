import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NbMenuItemCompact } from '../../../framework/theme/components/menu-compact/menu-compact.service';

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
    },
    {
      title: 'Change Password',
      icon: 'lock-outline',
    },
    {
      title: 'Privacy Policy',
      icon: { icon: 'checkmark-outline', pack: 'eva' },
    },
    {
      title: 'Logout',
      icon: 'unlock-outline',
    },
  ];
}
