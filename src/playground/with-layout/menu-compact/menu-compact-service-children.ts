import { Component } from '@angular/core';

@Component({
  selector: 'npg-menu-compact-item1',
  template: ` <h1 class="h4">Home</h1> `,
})
export class MenuCompactServiceItem1Component {}

@Component({
  selector: 'npg-menu-compact-item2',
  template: ` <h1 class="h4">User account</h1> `,
})
export class MenuCompactServiceItem2Component {}

@Component({
  selector: 'npg-menu-compact-item3',
  template: ` <router-outlet></router-outlet> `,
})
export class MenuCompactServiceItem3Component {}

@Component({
  selector: 'npg-menu-compact-item31',
  template: ` <h1 class="h4">Services</h1> `,
})
export class MenuCompactServiceItem31Component {}

@Component({
  selector: 'npg-menu-compact-item32',
  template: ` <h1 class="h4">Hardware</h1> `,
})
export class MenuCompactServiceItem32Component {}

@Component({
  selector: 'npg-menu-compact-item33',
  template: ` <router-outlet></router-outlet> `,
})
export class MenuCompactServiceItem33Component {}

@Component({
  selector: 'npg-menu-compact-item331',
  template: ` <h1 class="h4">Open Source Software</h1> `,
})
export class MenuCompactServiceItem331Component {}

@Component({
  selector: 'npg-menu-compact-item332',
  template: ` <h1 class="h4">Commercial Software</h1> `,
})
export class MenuCompactServiceItem332Component {}
