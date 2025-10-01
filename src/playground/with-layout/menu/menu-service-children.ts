/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'npg-menu-item1',
  template: ` <h1 class="h4">Home</h1> `,
  standalone: false,
})
export class MenuServiceItem1Component {}

@Component({
  selector: 'npg-menu-item2',
  template: ` <h1 class="h4">User account</h1> `,
  standalone: false,
})
export class MenuServiceItem2Component {}

@Component({
  selector: 'npg-menu-item3',
  template: ` <router-outlet></router-outlet> `,
  standalone: false,
})
export class MenuServiceItem3Component {}

@Component({
  selector: 'npg-menu-item31',
  template: ` <h1 class="h4">Services</h1> `,
  standalone: false,
})
export class MenuServiceItem31Component {}

@Component({
  selector: 'npg-menu-item32',
  template: ` <h1 class="h4">Hardware</h1> `,
  standalone: false,
})
export class MenuServiceItem32Component {}

@Component({
  selector: 'npg-menu-item33',
  template: ` <router-outlet></router-outlet> `,
  standalone: false,
})
export class MenuServiceItem33Component {}

@Component({
  selector: 'npg-menu-item331',
  template: ` <h1 class="h4">Open Source Software</h1> `,
  standalone: false,
})
export class MenuServiceItem331Component {}

@Component({
  selector: 'npg-menu-item332',
  template: ` <h1 class="h4">Commercial Software</h1> `,
  standalone: false,
})
export class MenuServiceItem332Component {}
