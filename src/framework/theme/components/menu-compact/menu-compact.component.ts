import { Component, Input, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, NavigationExtras } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { convertToBoolProperty, NbBooleanInput } from '../helpers';
import { NB_WINDOW } from '../../theme.options';
import { NbMenuCompactBag, NbMenuCompactInternalService, NbMenuItemCompact } from './menu-compact.service';

/**
 * Vertical menu component.
 *
 * Accepts a list of menu items and renders them accordingly. Supports multi-level menus.
 *
 * Basic example
 * @stacked-example(Showcase, menu/menu-showcase.component)
 *
 * ```ts
 * // ...
 * items: NbMenuItem[] = [
 *  {
 *    title: home,
 *    link: '/'
 *  },
 *  {
 *    title: dashboard,
 *    link: 'dashboard'
 *  }
 * ];
 * // ...
 * <nb-menu [items]="items"></nb-menu>
 * ```
 * ### Installation
 *
 * Import `NbMenuModule.forRoot()` to your app module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbMenuModule.forRoot(),
 *   ],
 * })
 * export class AppModule { }
 * ```
 * and `NbMenuModule` to your feature module where the component should be shown:
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbMenuModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * Two-level menu example
 * @stacked-example(Two Levels, menu/menu-children.component)
 *
 *
 * Auto collapse menu example
 * @stacked-example(Auto collapse Menu, menu/menu-autocollapse.component)
 *
 * Menu badge
 * @stacked-example(Menu item badge, menu/menu-badge.component)
 *
 * @styles
 *
 * menu-background-color:
 * menu-text-color:
 * menu-text-font-family:
 * menu-text-font-size:
 * menu-text-font-weight:
 * menu-text-line-height:
 * menu-group-text-color:
 * menu-item-border-radius:
 * menu-item-padding:
 * menu-item-hover-background-color:
 * menu-item-hover-cursor:
 * menu-item-hover-text-color:
 * menu-item-icon-hover-color:
 * menu-item-active-background-color:
 * menu-item-active-text-color:
 * menu-item-icon-active-color:
 * menu-item-icon-color:
 * menu-item-icon-margin:
 * menu-item-icon-width:
 * menu-item-divider-color:
 * menu-item-divider-style:
 * menu-item-divider-width:
 * menu-submenu-background-color:
 * menu-submenu-text-color:
 * menu-submenu-margin:
 * menu-submenu-padding:
 * menu-submenu-item-border-color:
 * menu-submenu-item-border-style:
 * menu-submenu-item-border-width:
 * menu-submenu-item-border-radius:
 * menu-submenu-item-padding:
 * menu-submenu-item-hover-background-color:
 * menu-submenu-item-hover-border-color:
 * menu-submenu-item-hover-text-color:
 * menu-submenu-item-icon-hover-color:
 * menu-submenu-item-active-background-color:
 * menu-submenu-item-active-border-color:
 * menu-submenu-item-active-text-color:
 * menu-submenu-item-icon-active-color:
 * menu-submenu-item-active-hover-background-color:
 * menu-submenu-item-active-hover-border-color:
 * menu-submenu-item-active-hover-text-color:
 * menu-submenu-item-icon-active-hover-color:
 */
@Component({
  selector: 'nb-menu-compact',
  styleUrls: ['./menu-compact.component.scss'],
  template: `
    <ul class="menu-items-compact">
      <ng-container *ngFor="let item of items">
        <li
          nbMenuItemCompact
          *ngIf="!item.hidden"
          [menuItem]="item"
          [badge]="item.badge"
          [class.menu-group]="item.group"
          (hoverItem)="onHoverItem($event)"
          (toggleSubMenu)="onToggleSubMenu($event)"
          (selectItem)="onSelectItem($event)"
          (itemClick)="onItemClick($event)"
          class="menu-item-compact"
        ></li>
      </ng-container>
    </ul>
  `,
})
export class NbMenuCompactComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Tags a menu with some ID, can be later used in the menu service
   * to determine which menu triggered the action, if multiple menus exist on the page.
   *
   * @type {string}
   */
  @Input() tag: string;

  /**
   * List of menu items.
   * @type List<NbMenuItem> | List<any> | any
   */
  @Input() items: NbMenuItemCompact[];

  /**
   * Collapse all opened submenus on the toggle event
   * Default value is "false"
   * @type boolean
   */
  @Input()
  get autoCollapse(): boolean {
    return this._autoCollapse;
  }
  set autoCollapse(value: boolean) {
    this._autoCollapse = convertToBoolProperty(value);
  }
  protected _autoCollapse: boolean = false;
  static ngAcceptInputType_autoCollapse: NbBooleanInput;

  protected destroy$ = new Subject<void>();

  constructor(
    @Inject(NB_WINDOW) protected window: Window,
    @Inject(PLATFORM_ID) protected platformId: string,
    protected menuInternalService: NbMenuCompactInternalService,
    protected router: Router,
  ) {}

  ngOnInit() {
    this.menuInternalService.prepareItems(this.items);

    this.menuInternalService
      .onAddItem()
      .pipe(
        filter((data: { tag: string; items: NbMenuItemCompact[] }) => this.compareTag(data.tag)),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => this.onAddItem(data));

    this.menuInternalService
      .onNavigateHome()
      .pipe(
        filter((data: { tag: string }) => this.compareTag(data.tag)),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.navigateHome());

    this.menuInternalService
      .onGetSelectedItem()
      .pipe(
        filter((data: { tag: string; listener: BehaviorSubject<NbMenuCompactBag> }) => this.compareTag(data.tag)),
        takeUntil(this.destroy$),
      )
      .subscribe((data: { tag: string; listener: BehaviorSubject<NbMenuCompactBag> }) => {
        data.listener.next({ tag: this.tag, item: this.getSelectedItem(this.items) });
      });

    this.menuInternalService
      .onCollapseAll()
      .pipe(
        filter((data: { tag: string }) => this.compareTag(data.tag)),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.collapseAll());

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.menuInternalService.selectFromUrl(this.items, this.tag, this.autoCollapse);
      });
  }

  ngAfterViewInit() {
    setTimeout(() => this.menuInternalService.selectFromUrl(this.items, this.tag, this.autoCollapse));
  }

  onAddItem(data: { tag: string; items: NbMenuItemCompact[] }) {
    this.items.push(...data.items);

    this.menuInternalService.prepareItems(this.items);
    this.menuInternalService.selectFromUrl(this.items, this.tag, this.autoCollapse);
  }

  onHoverItem(item: NbMenuItemCompact) {
    this.menuInternalService.itemHover(item, this.tag);
  }

  onToggleSubMenu(item: NbMenuItemCompact) {
    if (this.autoCollapse) {
      this.menuInternalService.collapseAll(this.items, this.tag, item);
    }
    item.expanded = !item.expanded;
    this.menuInternalService.submenuToggle(item, this.tag);
  }

  // TODO: is not fired on page reload
  onSelectItem(item: NbMenuItemCompact) {
    this.menuInternalService.selectItem(item, this.items, this.autoCollapse, this.tag);
  }

  onItemClick(item: NbMenuItemCompact) {
    this.menuInternalService.itemClick(item, this.tag);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected navigateHome() {
    const homeItem = this.getHomeItem(this.items);

    if (homeItem) {
      if (homeItem.link) {
        const extras: NavigationExtras = {
          queryParams: homeItem.queryParams,
          queryParamsHandling: homeItem.queryParamsHandling,
          fragment: homeItem.fragment,
          preserveFragment: homeItem.preserveFragment,
        };
        this.router.navigate([homeItem.link], extras).then((r) => console.info(r));
      }

      if (homeItem.url && isPlatformBrowser(this.platformId)) {
        this.window.location.href = homeItem.url;
      }
    }
  }

  protected collapseAll() {
    this.menuInternalService.collapseAll(this.items, this.tag);
  }

  protected getHomeItem(items: NbMenuItemCompact[]): NbMenuItemCompact {
    for (const item of items) {
      if (item.home) {
        return item;
      }

      const homeItem = item.children && this.getHomeItem(item.children);
      if (homeItem) {
        return homeItem;
      }
    }

    return undefined;
  }

  protected compareTag(tag: string) {
    return !tag || tag === this.tag;
  }

  protected getSelectedItem(items: NbMenuItemCompact[]): NbMenuItemCompact {
    let selected = null;
    items.forEach((item: NbMenuItemCompact) => {
      if (item.selected) {
        selected = item;
      }
      if (item.selected && item.children && item.children.length > 0) {
        selected = this.getSelectedItem(item.children);
      }
    });
    return selected;
  }
}
