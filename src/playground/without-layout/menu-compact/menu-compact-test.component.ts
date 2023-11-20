import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbMenuCompactService, NbMenuItemCompact } from '@nebular/theme';

@Component({
  selector: 'npg-menu-compact-test',
  template: `
    <nb-layout>
      <nb-sidebar state="compacted">
        <nb-menu-compact id="menu-sidebar" tag="sidebarMenu" [items]="sidebarMenuItems"></nb-menu-compact>
      </nb-sidebar>
      <nb-layout-column>
        <nb-card size="giant">
          <nb-card-body>
            <nb-menu-compact
              id="menu-first"
              tag="firstMenu"
              [items]="firstMenuItems"
              [autoCollapse]="true"
            ></nb-menu-compact>
            <router-outlet></router-outlet>
            <button nbButton id="addBtn" (click)="addMenuItem()">Add</button>
            <button nbButton id="homeBtn" (click)="navigateHome()">Home</button>
          </nb-card-body>
        </nb-card>
        <nb-card size="giant">
          <nb-card-body>
            <nb-menu-compact id="menu-second" tag="SecondMenu" [items]="secondMenuItems"></nb-menu-compact>
            <router-outlet></router-outlet>
            <button nbButton id="addBtn" (click)="addMenuItem()">Add</button>
            <button nbButton id="homeBtn" (click)="navigateHome()">Home</button>
          </nb-card-body>
        </nb-card>
        <nb-card size="giant">
          <nb-card-body>
            <nb-menu-compact id="menu-third" tag="thirdMenu" [items]="thirdMenuItems"></nb-menu-compact>
          </nb-card-body>
        </nb-card>
      </nb-layout-column>
    </nb-layout>
  `,
})
export class MenuCompactTestComponent implements OnInit, OnDestroy {
  sidebarMenuItems: NbMenuItemCompact[] = [
    {
      title: 'Menu Items Compact',
      group: true,
      icon: 'home-outline',
    },
    {
      title: 'Menu Compact #1',
      link: '/menu-compact/menu-compact-test.component/1',
      icon: 'home-outline',
      queryParams: { param: 1 },
      fragment: '#fragment',
    },
    {
      title: 'Menu Compact #2',
      link: '/menu-compact/menu-compact-test.component/2',
      icon: 'home-outline',
    },
    {
      title: 'Menu Compact #3',
      icon: 'home-outline',
      children: [
        {
          title: 'Menu Compact #3.1',
          link: '/menu-compact/menu-compact-test.component/3/1',
        },
        {
          title: 'Menu Compact #3.2',
          link: '/menu-compact/menu-compact-test.component/3/2',
        },
        {
          title: 'Menu Compact #3.3',
          children: [
            {
              title: 'Menu Compact #3.3.1',
              link: '/menu-compact/menu-compact-test.component/3/3/1',
            },
            {
              title: 'Menu Compact #3.3.2',
              link: '/menu-compact/menu-compact-test.component/3/3/2',
              queryParams: { param: 2 },
              fragment: '#fragment',
              home: true,
            },
            {
              title: '@nebular/theme',
              target: '_blank',
              url: 'https://github.com/akveo/ng2-admin',
            },
          ],
        },
      ],
    },
  ];
  firstMenuItems: NbMenuItemCompact[] = [
    {
      title: 'Menu Items Compact',
      group: true,
      icon: 'home-outline',
    },
    {
      title: 'Menu Compact #1',
      link: '/menu-compact/menu-compact-test.component/1',
      icon: 'home-outline',
      queryParams: { param: 1 },
      fragment: '#fragment',
    },
    {
      title: 'Menu Compact #2',
      link: '/menu-compact/menu-compact-test.component/2',
      icon: 'home-outline',
    },
  ];
  secondMenuItems: NbMenuItemCompact[] = [
    {
      title: 'Menu items compact with fragments ',
      group: true,
    },
    {
      title: 'Menu Compact #1',
      link: '/menu-compact/menu-compact-test.component/1',
      icon: 'home-outline',
      pathMatch: 'prefix',
    },
    {
      title: 'Menu Compact #12 + fragment',
      link: '/menu-compact/menu-compact-test.component/12',
      fragment: 'fragment',
      icon: 'home-outline',
    },
    {
      title: 'Menu Compact #3',
      link: '/menu-compact/menu-compact-test.component/3',
      icon: 'home-outline',
    },
  ];
  thirdMenuItems = [
    {
      title: 'Menu Compact #1',
    },
    {
      title: 'Menu Compact #2',
      children: [
        {
          title: 'Menu Compact #2.1',
        },
        {
          title: 'Hidden Submenu Item Compact',
          hidden: true,
        },
      ],
    },
    {
      title: 'Hidden Menu Item Compact',
      hidden: true,
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(private menuService: NbMenuCompactService) {}

  ngOnInit() {
    this.menuService
      .onItemClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: { tag: string; item: NbMenuItemCompact }) => console.info(data));

    this.menuService
      .onItemSelect()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: { tag: string; item: NbMenuItemCompact }) => console.info(data));

    // this.itemHoverSubscription = this.menuService.onItemHover()
    //   .subscribe((data: { tag: string, item: NbMenuItem }) => console.info(data));

    this.menuService
      .onSubmenuToggle()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: { tag: string; item: NbMenuItemCompact }) => console.info(data));

    this.menuService.addItems(
      [
        {
          title: 'Menu Compact #3',
          icon: 'home-outline',
          children: [
            {
              title: 'Menu Compact #3.1',
              link: '/menu-compact/menu-compact-test.component/3/1',
            },
            {
              title: 'Menu Compact #3.2',
              link: '/menu-compact/menu-compact-test.component/3/2',
            },
            {
              title: 'Menu Compact #3.3',
              children: [
                {
                  title: 'Menu Compact #3.3.1',
                  link: '/menu-compact/menu-compact-test.component/3/3/1',
                },
                {
                  title: 'Menu Compact #3.3.2',
                  link: '/menu-compact/menu-compact-test.component/3/3/2',
                  queryParams: { param: 2 },
                  fragment: '#fragment',
                  home: true,
                },
                {
                  title: '@nebular/theme',
                  target: '_blank',
                  url: 'https://github.com/akveo/ng2-admin',
                },
              ],
            },
          ],
        },
      ],
      'firstMenu',
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addMenuItem() {
    this.menuService.addItems([{ title: 'New Menu Item Compact' }], 'firstMenu');
  }

  navigateHome() {
    this.menuService.navigateHome('firstMenu');
  }
}
