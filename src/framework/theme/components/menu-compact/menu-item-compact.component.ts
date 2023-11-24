import { AfterViewInit, Component, DoCheck, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  NbMenuCompactBadgeConfig,
  NbMenuCompactBag,
  NbMenuCompactService,
  NbMenuItemCompact,
} from './menu-compact.service';
import { Subject } from 'rxjs';
import { NbLayoutDirectionService } from '../../services/direction.service';
import { filter, map, takeUntil } from 'rxjs/operators';

export enum NbToggleStatesCompact {
  Expanded = 'expanded',
  Collapsed = 'collapsed',
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[nbMenuItemCompact]',
  templateUrl: './menu-item-compact.component.html',
  animations: [
    trigger('toggle', [
      state(
        NbToggleStatesCompact.Collapsed,
        style({
          position: 'absolute',
          transform: 'translate3d(0, 0, 0)',
          opacity: 0,
          display: 'none',
          pointerEvents: 'none',
          top: '{{menuItemLevel}}',
        }),
        { params: { menuItemLevel: 'auto' } },
      ),
      state(
        NbToggleStatesCompact.Expanded,
        style({
          position: 'absolute',
          transform: 'translate3d(var(--sidebar-width-compact), 0, 0)',
          opacity: 1,
          display: 'block',
          top: '{{menuItemLevel}}',
        }),
        { params: { menuItemLevel: 'auto' } },
      ),
      /*  transition(
        `${NbToggleStatesCompact.Collapsed} <=> ${NbToggleStatesCompact.Expanded}`,
        animate('0.015s ease-in-out'),
      ),*/
    ]),
  ],
})
export class NbMenuItemCompactComponent implements DoCheck, AfterViewInit, OnDestroy {
  @Input() menuItem = <NbMenuItemCompact>null;
  @Input() badge: NbMenuCompactBadgeConfig;

  @Output() hoverItem = new EventEmitter<any>();
  @Output() toggleSubMenu = new EventEmitter<any>();
  @Output() selectItem = new EventEmitter<any>();
  @Output() itemClick = new EventEmitter<any>();

  protected destroy$ = new Subject<void>();
  toggleState: NbToggleStatesCompact;

  constructor(
    protected menuService: NbMenuCompactService,
    protected directionService: NbLayoutDirectionService,
  ) {}

  ngDoCheck() {
    this.toggleState = this.menuItem.expanded ? NbToggleStatesCompact.Expanded : NbToggleStatesCompact.Collapsed;
  }

  ngAfterViewInit() {
    this.menuService
      .onSubmenuToggle()
      .pipe(
        filter(({ item }) => item === this.menuItem),
        map(({ item }: NbMenuCompactBag) => item.expanded),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (isExpanded) =>
          (this.toggleState = isExpanded ? NbToggleStatesCompact.Expanded : NbToggleStatesCompact.Collapsed),
      );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleSubMenu(item: NbMenuItemCompact) {
    this.toggleSubMenu.emit(item);
  }

  onHoverItem(item: NbMenuItemCompact) {
    this.hoverItem.emit(item);
  }

  onSelectItem(item: NbMenuItemCompact) {
    this.selectItem.emit(item);
  }

  onItemClick(item: NbMenuItemCompact) {
    this.itemClick.emit(item);
  }

  getExpandStateIcon(): string {
    if (this.menuItem.expanded) {
      return 'chevron-down-outline';
    }

    return this.directionService.isLtr() ? 'chevron-up-outline' : 'chevron-right-outline';
  }
}
