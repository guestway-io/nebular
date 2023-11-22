import { Component, OnDestroy } from '@angular/core';
import { NbMenuCompactService } from '@nebular/theme';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MENU_COMPACT_ITEMS } from './menu-compact-service-items';

@Component({
  selector: 'npg-menu-compact-services',
  template: `
    <nb-card size="giant">
      <nb-menu-compact tag="menu-compact" [items]="menuItems"></nb-menu-compact>
      <div class="control-panel">
        <router-outlet></router-outlet>
        <h3 class="h4">Selected item: {{ selectedItem }}</h3>
        <button nbButton (click)="addMenuItem()">Add Menu Item</button>
        <button nbButton (click)="collapseAll()">Collapse all menu items</button>
        <button nbButton (click)="navigateHome()">Home</button>
        <button nbButton (click)="getSelectedItem()">Get Selected Item</button>
      </div>
    </nb-card>
  `,
  styleUrls: ['./menu-compact-service.component.scss'],
})
export class MenuCompactServiceComponent implements OnDestroy {
  menuItems = MENU_COMPACT_ITEMS;

  private destroy$ = new Subject<void>();
  selectedItem: string;

  constructor(private menuService: NbMenuCompactService) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addMenuItem() {
    this.menuService.addItems(
      [
        {
          title: '@nebular/theme',
          target: '_blank',
          icon: 'plus-outline',
          url: 'https://github.com/akveo/ngx-admin',
          level: 0,
        },
      ],
      'menu-compact',
    );
  }

  collapseAll() {
    this.menuService.collapseAll('menu-compact');
  }

  navigateHome() {
    this.menuService.navigateHome('menu-compact');
  }

  getSelectedItem() {
    this.menuService
      .getSelectedItem('menu-compact')
      .pipe(takeUntil(this.destroy$))
      .subscribe((menuBag) => {
        this.selectedItem = menuBag.item?.title;
      });
  }
}
