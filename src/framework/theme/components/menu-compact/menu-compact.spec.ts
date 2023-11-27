import {
  Component,
  DebugElement,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
  Injectable,
  ProviderToken,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { SpyLocation } from '@angular/common/testing';
import { pairwise, take } from 'rxjs/operators';
import {
  getFragmentPartOfUrl,
  isFragmentContain,
  isFragmentEqual,
  isUrlPathContain,
  isUrlPathEqual,
  getPathPartOfUrl,
} from './url-matching-helpers';
import {
  NbIconComponent,
  NbIconLibraries,
  NbLayoutDirection,
  NbLayoutDirectionService,
  NbMenuCompactModule,
  NbMenuCompactBag,
  NbMenuItemCompact,
  NbMenuCompactService,
  NbMenuCompactComponent,
  NbThemeModule,
} from '@nebular/theme';
import { NbMenuCompactInternalService } from './menu-compact.service';

@Component({ template: '' })
export class NoopComponent {}

@Component({
  template: `<nb-menu-compact [items]="items" [tag]="menuTag"></nb-menu-compact>`,
})
export class SingleMenuTestComponent {
  constructor(public menuPublicService: NbMenuCompactService) {}
  @Input() items: NbMenuItemCompact[];
  @Input() menuTag: string;
  @ViewChild(NbMenuCompactComponent) menuComponent: NbMenuCompactComponent;
}

@Component({
  template: `
    <nb-menu-compact [items]="firstMenuItems" [tag]="firstMenuTag"></nb-menu-compact>
    <nb-menu-compact [items]="secondMenuItems" [tag]="secondMenuTag"></nb-menu-compact>
  `,
})
export class DoubleMenusTestComponent {
  constructor(public menuPublicService: NbMenuCompactService) {}
  @Input() firstMenuItems: NbMenuItemCompact[];
  @Input() secondMenuItems: NbMenuItemCompact[];
  @Input() firstMenuTag: string;
  @Input() secondMenuTag: string;
  @ViewChildren(NbMenuCompactComponent) menuComponent: QueryList<NbMenuCompactComponent>;
}

// Overrides SpyLocation path method to take into account `includeHash` parameter.
// Original SpyLocation ignores parameters and always returns path with hash which is different
// from Location.
@Injectable()
export class SpyLocationPathParameter extends SpyLocation {
  path(includeHash: boolean = false): string {
    const path = super.path();

    if (includeHash) {
      return path;
    }

    return getPathPartOfUrl(path);
  }
}

function createTestBed(routes: Routes = []) {
  TestBed.configureTestingModule({
    imports: [
      NbThemeModule.forRoot(),
      NbMenuCompactModule.forRoot(),
      RouterTestingModule.withRoutes(routes),
      NoopAnimationsModule,
    ],
    declarations: [SingleMenuTestComponent, DoubleMenusTestComponent, NoopComponent],
    providers: [NbMenuCompactService],
  });

  TestBed.overrideProvider(Location, { useValue: new SpyLocationPathParameter() });

  const iconLibs: NbIconLibraries = TestBed.inject(NbIconLibraries);
  iconLibs.registerSvgPack('test', { 'some-icon': '<svg>some-icon</svg>' });
  iconLibs.setDefaultPack('test');
}

function createSingleMenuComponent(menuItems: NbMenuItemCompact[], menuTag = 'menu-compact') {
  createTestBed();
  const fixture = TestBed.createComponent(SingleMenuTestComponent);
  fixture.componentInstance.items = menuItems;
  fixture.componentInstance.menuTag = menuTag;
  const menuService = fixture.componentInstance.menuPublicService;
  fixture.detectChanges();
  return { fixture, menuService };
}

function createDoubleMenuComponent(
  firstMenuItems: NbMenuItemCompact[],
  firstMenuTag: string,
  secondMenuItems: NbMenuItemCompact[],
  secondMenuTag: string,
) {
  createTestBed();
  const fixture = TestBed.createComponent(DoubleMenusTestComponent);
  fixture.componentInstance.firstMenuItems = firstMenuItems;
  fixture.componentInstance.secondMenuItems = secondMenuItems;
  fixture.componentInstance.firstMenuTag = firstMenuTag;
  fixture.componentInstance.secondMenuTag = secondMenuTag;
  const menuService = fixture.componentInstance.menuPublicService;
  fixture.detectChanges();
  return { fixture, menuService };
}

function createMenuItems(
  items: NbMenuItemCompact[],
  menuInternalService: NbMenuCompactInternalService,
): NbMenuItemCompact[] {
  menuInternalService.prepareItems(items);
  return items as NbMenuItemCompact[];
}

describe('NbMenuItem', () => {
  it('should set tag attribute for menu services', () => {
    const { fixture } = createSingleMenuComponent([{ title: 'Home' }], 'menu-compact');
    const nbMenuTag = fixture.componentInstance.menuComponent.tag;
    expect(nbMenuTag).toEqual('menu-compact');
  });

  it('should set icon to menu item', () => {
    const { fixture } = createSingleMenuComponent([{ title: 'Home', icon: 'some-icon' }]);
    const iconWrapper = fixture.nativeElement.querySelector('.menu-icon-compact');
    expect(iconWrapper.textContent).toContain('some-icon');
  });

  it('should set title to menu item', () => {
    const { fixture } = createSingleMenuComponent([{ title: 'Test title' }]);
    const titleWrapper = fixture.nativeElement.querySelector('.menu-title-compact').innerHTML;
    expect(titleWrapper).toEqual('Test title');
  });

  it('should set link target to menu item', () => {
    const { fixture } = createSingleMenuComponent([
      { title: 'Link with _blank target', link: '/profile', target: '_blank' },
      { title: 'Link with _self target', link: '/profile', target: '_self' },
      { title: 'Link with any not valid target', link: '/profile', target: 'anyNotValid' },
    ]);

    const menuLinks = fixture.nativeElement.querySelectorAll('div.menu-item-compact__container');

    expect(menuLinks[0].querySelector('ul.menu-items-compact > a').getAttribute('target')).toEqual('_blank');
    expect(menuLinks[1].querySelector('ul.menu-items-compact > a').getAttribute('target')).toEqual('_self');
    expect(menuLinks[2].querySelector('ul.menu-items-compact > a').getAttribute('target')).toEqual('anyNotValid');
  });

  it('should have only span, without link on group element', () => {
    const { fixture } = createSingleMenuComponent([{ title: 'Group item', group: true }]);
    const menuItem = fixture.nativeElement.querySelector('.menu-item-compact');
    expect(menuItem.querySelector('a')).toBeNull();
    expect(menuItem.querySelector('span')).not.toBeNull();
  });

  it('should not render hidden element', () => {
    const { fixture } = createSingleMenuComponent([
      { title: 'Visible item' },
      { title: 'Hidden item', hidden: true },
      { title: 'Visible item' },
    ]);
    const menuList = fixture.nativeElement.querySelectorAll('.menu-item-compact');
    expect(menuList.length).toEqual(2);
  });

  it('should set child menu items', () => {
    const { fixture } = createSingleMenuComponent([
      {
        title: 'Parent item',
        expanded: true,
        children: [{ title: 'Child item' }],
      },
    ]);
    const parentItem = fixture.nativeElement.querySelector('.menu-item-compact');
    expect(parentItem.querySelector('ul.menu-items-compact')).not.toBeNull();
  });

  it('should expand child menu items', () => {
    const { fixture } = createSingleMenuComponent([
      { title: 'Parent item', expanded: true, children: [{ title: 'Child item' }] },
    ]);

    const childList = fixture.nativeElement.querySelectorAll(
      'nb-menu-compact > ul.menu-items-compact > li.menu-item-compact > div > ul.menu-items-compact',
    )[0];
    expect(childList.classList).toContain('expanded');
  });

  it('should set URL', () => {
    const { fixture } = createSingleMenuComponent([{ title: 'Menu Item with link', url: 'https://test.link' }]);
    const menuItem = fixture.nativeElement.querySelector('.menu-item-compact');
    expect(menuItem.querySelector('a').getAttribute('href')).toEqual('https://test.link');
  });

  it('should set selected item', () => {
    const selectedItem = {
      title: 'Menu item 1',
      children: [{ title: 'Menu item selected', selected: true }],
    };
    const { fixture } = createSingleMenuComponent([selectedItem]);
    const activeItem = fixture.nativeElement.querySelector(
      'nb-menu-compact > ul.menu-items-compact > li.menu-item-compact > div.menu-item-compact__container > ul.menu-items-compact > li.menu-item-compact > div.menu-item-compact__container > div.menu-item-compact__container--default',
    );

    expect(activeItem.querySelector('span').innerHTML).toEqual(selectedItem.children[0].title);
  });

  it('should change arrow direction when document direction changes', () => {
    const menuItems = [{ title: '', children: [{ title: '', children: [{ title: '' }] }] }];
    const { fixture } = createSingleMenuComponent(menuItems);
    const iconComponent = fixture.debugElement.query(By.directive(NbIconComponent)) as DebugElement;
    const directionService: NbLayoutDirectionService = TestBed.inject(NbLayoutDirectionService);
    expect(iconComponent.componentInstance.icon).toEqual('chevron-up-outline');

    directionService.setDirection(NbLayoutDirection.RTL);
    fixture.detectChanges();

    expect(iconComponent.componentInstance.icon).toEqual('chevron-right-outline');
  });
});

describe('menu services', () => {
  it('should operate with menu by tag', () => {
    const { fixture, menuService } = createDoubleMenuComponent(
      [{ title: 'Home' }],
      'menuFirst',
      [{ title: 'Home' }],
      'menuSecond',
    );
    const itemToAdd = { title: 'Added item' };
    const initialFirstMenuItemsCount = fixture.nativeElement
      .querySelector('nb-menu-compact:first-child')
      .querySelectorAll('.menu-item-compact').length;
    const initialSecondMenuItemsCount = fixture.nativeElement
      .querySelector('nb-menu-compact:last-child')
      .querySelectorAll('.menu-item-compact').length;
    menuService.addItems([itemToAdd], 'menuFirst');
    fixture.detectChanges();
    const afterAddFirstMenuItemsCount = fixture.nativeElement
      .querySelector('nb-menu-compact:first-child')
      .querySelectorAll('.menu-item-compact').length;
    const afterAddSecondMenuItemsCount = fixture.nativeElement
      .querySelector('nb-menu-compact:last-child')
      .querySelectorAll('.menu-item-compact').length;
    expect(afterAddFirstMenuItemsCount).toEqual(initialFirstMenuItemsCount + 1);
    expect(afterAddSecondMenuItemsCount).toEqual(initialSecondMenuItemsCount);
  });

  it('should add new items to DOM', () => {
    const { fixture, menuService } = createSingleMenuComponent([{ title: 'Existing item' }]);
    const itemToAdd = { title: 'Added item' };
    const menuListOnInit = fixture.nativeElement.querySelectorAll('li').length;
    menuService.addItems([itemToAdd], 'menu-compact');
    fixture.detectChanges();
    const menuListItemAdded = fixture.nativeElement.querySelectorAll('li').length;
    expect(menuListItemAdded).toEqual(menuListOnInit + 1);
  });

  it('should get selected menu item', (done) => {
    const selectedItem = { title: 'Menu item selected', selected: true };
    const { menuService } = createSingleMenuComponent([{ title: 'Menu item not selected' }, selectedItem]);
    menuService
      .getSelectedItem('menu-compact')
      .pipe(take(1))
      .subscribe((menuBag: NbMenuCompactBag) => {
        expect(menuBag.item.title).toEqual(selectedItem.title);
        done();
      });
  }, 1000);

  it('should hide all expanded menu items', (done) => {
    const { fixture, menuService } = createSingleMenuComponent([
      {
        title: 'Menu item collapsed',
        children: [{ title: 'Menu item inner' }],
      },
      {
        title: 'Menu item expanded 1',
        expanded: true,
        children: [{ title: 'Menu item inner' }],
      },
      {
        title: 'Menu item expanded 2',
        expanded: true,
        children: [{ title: 'Menu item inner' }],
      },
    ]);
    menuService
      .onSubmenuToggle()
      .pipe(pairwise(), take(1))
      .subscribe(([menuBagFirstCollapsed, menuBagSecondCollapsed]: NbMenuCompactBag[]) => {
        expect(menuBagFirstCollapsed.item.title).toEqual('Menu item expanded 1');
        expect(menuBagSecondCollapsed.item.title).toEqual('Menu item expanded 2');
        done();
      });
    menuService.collapseAll();
    fixture.detectChanges();
  }, 1000);
});

describe('NbMenuInternalService', () => {
  let router: Router;
  let menuInternalService: NbMenuCompactInternalService;

  beforeEach(() => {
    const routes = [
      { path: 'menu-1', component: NoopComponent },
      { path: 'menu-1/2', component: NoopComponent },
      {
        path: 'menu-2',
        component: NoopComponent,
        children: [{ path: 'menu-2-level-2', component: NoopComponent }],
      },
    ];
    createTestBed(routes);
    router = TestBed.inject(Router);
    const internalServiceToken = NbMenuCompactModule.forRoot().providers[1];
    menuInternalService = TestBed.inject(internalServiceToken as ProviderToken<NbMenuCompactInternalService>);
  });

  describe('selectFromUrl pathMatch full', () => {
    it('should select menu item with matching path', (done) => {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      router.navigate([menuItem.link]).then(() => {
        menuInternalService.selectFromUrl(menuItems as NbMenuItemCompact[], '');
        expect(menuItem.selected).toEqual(true);
        done();
      });
    });

    it('should select menu item with matching path and fragment', (done) => {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', fragment: '1', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      router.navigate([menuItem.link], { fragment: menuItem.fragment }).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toEqual(true);
        done();
      });
    });

    it('should select child menu item and its parent', (done) => {
      const items: NbMenuItemCompact[] = [
        {
          link: '/menu-2',
          title: 'menu-1',
          children: [{ link: '/menu-2/menu-2-level-2', title: 'menu-2' }] as NbMenuItemCompact[],
        },
      ];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const parentMenuItem: NbMenuItemCompact = menuItems[0];
      const childMenuItem: NbMenuItemCompact = parentMenuItem.children[0];

      expect(parentMenuItem.selected).toBeFalsy();
      expect(childMenuItem.selected).toBeFalsy();

      router.navigate([childMenuItem.link]).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(parentMenuItem.selected).toEqual(true);
        expect(childMenuItem.selected).toEqual(true);
        done();
      });
    });

    it('should select child menu item with fragment', (done) => {
      const items: NbMenuItemCompact[] = [
        {
          link: '/menu-2',
          title: 'menu-2',
          children: [
            { link: '/menu-2/menu-2-level-2', fragment: '22', title: 'menu-2-level-2' },
          ] as NbMenuItemCompact[],
        },
      ];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const parentMenuItem: NbMenuItemCompact = menuItems[0];
      const childMenuItem: NbMenuItemCompact = parentMenuItem.children[0];

      expect(parentMenuItem.selected).toBeFalsy();
      expect(childMenuItem.selected).toBeFalsy();

      router.navigate([childMenuItem.link], { fragment: childMenuItem.fragment }).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(parentMenuItem.selected).toEqual(true);
        expect(childMenuItem.selected).toEqual(true);
        done();
      });
    });

    it("should not select menu item with matching path if fragment doesn't match", function (done) {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', fragment: '1', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      router.navigate([menuItem.link], { fragment: menuItem.fragment + 'random-fragment' }).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toBeFalsy();
        done();
      });
    });

    it("should not select menu item with matching fragment if path doesn't match", function (done) {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', fragment: '1', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      const url = menuItem.link + '/2';
      router.navigate([url], { fragment: menuItem.fragment }).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toBeFalsy();
        done();
      });
    });

    it('should not select menu item with fragment if no fragment in url', (done) => {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', fragment: '1', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      router.navigate([menuItem.link]).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toBeFalsy();
        done();
      });
    });

    it('should not select menu item if path not matches fully', (done) => {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', fragment: '1', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      const url = menuItem.link + '/2';
      router.navigate([url], { fragment: menuItem.fragment }).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toBeFalsy();
        done();
      });
    });

    it('should not select menu item if path and fragment not matches fully', (done) => {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', fragment: '1', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      router.navigate([menuItem.link], { fragment: menuItem.fragment + '1' }).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toBeFalsy();
        done();
      });
    });
  });

  describe('selectFromUrl pathMatch prefix', () => {
    it('should select menu item if url contains menu link', function (done) {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', pathMatch: 'prefix', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      const url = menuItem.link + '/2';
      router.navigate([url]).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toEqual(true);
        done();
      });
    });

    it('should select menu item if url contains menu link and fragment', function (done) {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', fragment: '1', pathMatch: 'prefix', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      router.navigate([menuItem.link], { fragment: menuItem.fragment + '1' }).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toEqual(true);
        done();
      });
    });

    it('should not select menu item if url contains link without fragment', function (done) {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', fragment: '1', pathMatch: 'prefix', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      router.navigate([menuItem.link]).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toBeFalsy();
        done();
      });
    });

    it('should not select menu item if url contains fragment without link', function (done) {
      const items: NbMenuItemCompact[] = [{ link: '/menu-1', fragment: '1', pathMatch: 'prefix', title: 'menu-1' }];
      const menuItems: NbMenuItemCompact[] = createMenuItems(items, menuInternalService);
      const menuItem: NbMenuItemCompact = menuItems[0];

      expect(menuItem.selected).toBeFalsy();

      router.navigate(['menu-2'], { fragment: menuItem.fragment }).then(() => {
        menuInternalService.selectFromUrl(menuItems, '');
        expect(menuItem.selected).toBeFalsy();
        done();
      });
    });
  });
});

describe('menu URL helpers', () => {
  it('isUrlPathContain should work by url segments', () => {
    expect(isUrlPathContain('/a/ba', '/a/b')).toBeFalsy();
    expect(isUrlPathContain('/a/b/c', '/a/b')).toBeTruthy();
  });

  it('isUrlPathContain should work for url with fragments', () => {
    expect(isUrlPathContain('/a/b#fragment', '/a/b')).toBeTruthy();
  });

  it('isUrlPathContain should work for url with query strings', () => {
    expect(isUrlPathContain('/a/b?a=1;b=2&c=3', '/a/b')).toBeTruthy();
  });

  it('isUrlPathEqual should work for identical paths', () => {
    expect(isUrlPathEqual('/a/b/c', '/a/b')).toBeFalsy();
    expect(isUrlPathEqual('/a/b/c', '/a/b/c')).toBeTruthy();
  });

  it('isUrlPathEqual should work for url with fragments', () => {
    expect(isUrlPathEqual('/a/b/c#fragment', '/a/b/c')).toBeTruthy();
  });

  it('isUrlPathEqual should work for url with query strings', () => {
    expect(isUrlPathEqual('/a/b/c?a=1;b=2&c=3', '/a/b/c')).toBeTruthy();
  });

  it('getFragmentPartOfUrl should return empty string for path without fragment', () => {
    expect(getFragmentPartOfUrl('/a/b')).toBeFalsy();
    expect(getFragmentPartOfUrl('/a/b/c?a=1;b=2&c=3')).toBeFalsy();
  });

  it('getFragmentPartOfUrl should return fragment part when it presented', () => {
    expect(getFragmentPartOfUrl('/a/b#f')).toEqual('f');
    expect(getFragmentPartOfUrl('/a/b/c?a=1;b=2&c=3#fragment')).toEqual('fragment');
  });

  it('isFragmentEqual should return false for path without fragments', () => {
    expect(isFragmentEqual('/a/b', 'fragment')).toBeFalsy();
    expect(isFragmentEqual('/a/b/c?a=1;b=2&c=3', 'fragment')).toBeFalsy();
  });

  it('isFragmentEqual should return false for path with different fragments', () => {
    expect(isFragmentEqual('/a/b#f', 'fragment')).toBeFalsy();
    expect(isFragmentEqual('/a/b/c?a=1;b=2&c=3#f', 'fragment')).toBeFalsy();
  });

  it('isFragmentEqual should return true for path with same fragments', () => {
    expect(isFragmentEqual('/a/b#fragment', 'fragment')).toBeTruthy();
    expect(isFragmentEqual('/a/b/c?a=1;b=2&c=3#fragment', 'fragment')).toBeTruthy();
  });

  it('isFragmentContain should return true for url with exact fragment', () => {
    expect(isFragmentContain('/a/b#1', '1')).toBeTruthy();
    expect(isFragmentContain('/#2', '2')).toBeTruthy();
  });

  it('isFragmentContain should return true for url containing fragments', () => {
    expect(isFragmentContain('/a/b#12', '1')).toBeTruthy();
    expect(isFragmentContain('/a/b?a=1;b=2&c=3#21', '1')).toBeTruthy();
  });

  it('isFragmentContain should return false for url without fragment', () => {
    expect(isFragmentContain('/a1/b', '1')).toBeFalsy();
    expect(isFragmentContain('/a1/b?a=1;b=2&c=3', '1')).toBeFalsy();
  });

  it('isFragmentContain should return false for url with different fragment', () => {
    expect(isFragmentContain('/a1/b#222', '1')).toBeFalsy();
    expect(isFragmentContain('/a1/b?a=1;b=2&c=3#222', '1')).toBeFalsy();
  });
});
