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
      level: 0,
    },
    {
      title: 'Menu Compact #1',
      link: '/menu-compact/menu-compact-test.component/1',
      icon: 'home-outline',
      queryParams: { param: 1 },
      fragment: '#fragment',
      level: 0,
    },
    {
      title: 'Menu Compact #2',
      link: '/menu-compact/menu-compact-test.component/2',
      icon: 'home-outline',
      level: 0,
    },
    {
      title: 'Menu Compact #3',
      icon: 'home-outline',
      level: 0,
      children: [
        {
          title: 'Menu Compact #3.1',
          link: '/menu-compact/menu-compact-test.component/3/1',
          level: 0,
        },
        {
          title: 'Menu Compact #3.2',
          link: '/menu-compact/menu-compact-test.component/3/2',
          level: 0,
        },
        {
          title: 'Menu Compact #3.3',
          level: 0,
          children: [
            {
              title: 'Menu Compact #3.3.1',
              link: '/menu-compact/menu-compact-test.component/3/3/1',
              level: 0,
            },
            {
              title: 'Menu Compact #3.3.2',
              link: '/menu-compact/menu-compact-test.component/3/3/2',
              queryParams: { param: 2 },
              fragment: '#fragment',
              home: true,
              level: 0,
            },
            {
              title: '@nebular/theme',
              target: '_blank',
              url: 'https://github.com/akveo/ng2-admin',
              level: 0,
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
      level: 0,
    },
    {
      title: 'Menu Compact #1',
      link: '/menu-compact/menu-compact-test.component/1',
      icon: 'home-outline',
      queryParams: { param: 1 },
      fragment: '#fragment',
      level: 0,
    },
    {
      title: 'Menu Compact #2',
      link: '/menu-compact/menu-compact-test.component/2',
      icon: 'home-outline',
      level: 0,
    },
  ];
  secondMenuItems: NbMenuItemCompact[] = [
    {
      title: 'Menu items compact with fragments ',
      group: true,
      level: 0,
    },
    {
      title: 'Menu Compact #1',
      link: '/menu-compact/menu-compact-test.component/1',
      icon: 'home-outline',
      pathMatch: 'prefix',
      level: 0,
    },
    {
      title: 'Menu Compact #12 + fragment',
      link: '/menu-compact/menu-compact-test.component/12',
      fragment: 'fragment',
      icon: 'home-outline',
      level: 0,
    },
    {
      title: 'Menu Compact #3',
      link: '/menu-compact/menu-compact-test.component/3',
      icon: 'home-outline',
      level: 0,
    },
  ];
  thirdMenuItems = [
    {
      title: 'Menu Compact #1',
      level: 0,
    },
    {
      title: 'Menu Compact #2',
      level: 0,
      children: [
        {
          title: 'Menu Compact #2.1',
          level: 1,
        },
        {
          title: 'Hidden Submenu Item Compact',
          level: 2,
          hidden: true,
        },
      ],
    },
    {
      title: 'Hidden Menu Item Compact',
      hidden: true,
      level: 0,
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
          level: 0,
          children: [
            {
              title: 'Menu Compact #3.1',
              link: '/menu-compact/menu-compact-test.component/3/1',
              level: 1,
            },
            {
              title: 'Menu Compact #3.2',
              link: '/menu-compact/menu-compact-test.component/3/2',
              level: 1,
            },
            {
              title: 'Menu Compact #3.3',
              level: 1,
              children: [
                {
                  title: 'Menu Compact #3.3.1',
                  link: '/menu-compact/menu-compact-test.component/3/3/1',
                  level: 2,
                },
                {
                  title: 'Menu Compact #3.3.2',
                  link: '/menu-compact/menu-compact-test.component/3/3/2',
                  queryParams: { param: 2 },
                  fragment: '#fragment',
                  home: true,
                  level: 2,
                },
                {
                  title: '@nebular/theme',
                  target: '_blank',
                  url: 'https://github.com/akveo/ng2-admin',
                  level: 2,
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
    this.menuService.addItems([{ title: 'New Menu Item Compact', level: 0 }], 'firstMenu');
  }

  navigateHome() {
    this.menuService.navigateHome('firstMenu');
  }
}
