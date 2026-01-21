/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { merge, Subject } from 'rxjs';
import { startWith, switchMap, take, takeUntil } from 'rxjs/operators';

import { NbComponentSize } from '../component-size';
import { convertToBoolProperty, NbBooleanInput } from '../helpers';
import { NbOptionComponent } from './option.component';
import { NbFocusableOption, NbFocusKeyManager, NbFocusKeyManagerFactoryService } from '../cdk/a11y/focus-key-manager';
import { NbHighlightableOption } from '../cdk/a11y/descendant-key-manager';
import { NB_SELECT_INJECTION_TOKEN } from '../select/select-injection-tokens';
import { NbSelectComponent, NbSearchableOption } from '../select/select.component';
import { NbPositionBuilderService, NbAdjustment, NbPosition } from '../cdk/overlay/overlay-position';
import { NbOverlayService } from '../cdk/overlay/overlay-service';
import { NB_DOCUMENT } from '../../theme.options';
import { NbOverlayRef, NbTemplatePortal } from '../cdk/overlay/mapping';
import { ESCAPE, UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, ENTER, SPACE } from '../cdk/keycodes/keycodes';

/**
 * NbOptionNestedComponent
 *
 * A nested option component that displays child options in a submenu.
 * When there's enough viewport space, the submenu appears on hover to the side.
 * When space is constrained, clicking enters "replacement mode" where children
 * replace the main option list with a back button.
 *
 * @example
 * ```html
 * <nb-select placeholder="Select category">
 *   <nb-option value="simple">Simple Option</nb-option>
 *
 *   <nb-option-nested title="Category">
 *     <nb-option value="cleaning">Cleaning</nb-option>
 *     <nb-option value="branding">Branding</nb-option>
 *   </nb-option-nested>
 * </nb-select>
 * ```
 *
 * @styles
 *
 * option-nested-text-color:
 * option-nested-chevron-color:
 * option-nested-hover-background-color:
 * option-nested-hover-text-color:
 * option-nested-disabled-text-color:
 * option-nested-disabled-chevron-color:
 */
@Component({
  selector: 'nb-option-nested',
  styleUrls: ['./option-nested.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="option-nested-trigger"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (click)="onClick($event)"
    >
      <nb-icon *ngIf="icon" class="option-nested-custom-icon" [icon]="icon" [pack]="pack"></nb-icon>
      <span class="option-nested-title">{{ title }}</span>
      <nb-icon
        class="option-nested-chevron"
        status="basic"
        icon="chevron-right-outline"
        pack="nebular-essentials"
      ></nb-icon>
    </div>

    <!-- Template for overlay submenu (includes nb-option-list wrapper) -->
    <ng-template #childrenTemplate>
      <nb-option-list [size]="size" class="nb-option-nested-pane" (mouseenter)="onOverlayMouseEnter()">
        <!-- Sticky search header for overlay submenu -->
        <div *ngIf="searchable" class="select-search-header">
          <input
            #overlaySearchInput
            type="text"
            class="select-search-input"
            [placeholder]="searchPlaceholder"
            (input)="onOverlaySearchInput($event)"
            (keydown)="onOverlaySearchKeydown($event)"
            autocomplete="off"
          />
        </div>

        <!-- Search results mode (overlay) -->
        <ng-container *ngIf="isOverlaySearching">
          <ng-container *ngIf="overlaySearchResults.length; else overlayEmptyResults">
            <div
              *ngFor="let result of overlaySearchResults; let i = index"
              class="search-result-item overlay-search-result-item"
              [class.active]="overlaySearchResultActiveIndex === i"
              tabindex="-1"
              (click)="selectOverlaySearchResult(result)"
              (keydown)="onOverlaySearchResultKeydown($event, i)"
              (mouseenter)="onOverlaySearchResultMouseEnter(i)"
            >
              <span *ngIf="result.path.length" class="search-result-path"> {{ result.path.join(' > ') }} &gt; </span>
              <span class="search-result-label">{{ result.label }}</span>
            </div>
          </ng-container>
          <ng-template #overlayEmptyResults>
            <div class="search-empty-message">{{ searchEmptyMessage }}</div>
          </ng-template>
        </ng-container>

        <!-- Regular content when not searching -->
        <ng-container *ngIf="!isOverlaySearching">
          <ng-container *ngTemplateOutlet="childrenContentTemplate"></ng-container>
        </ng-container>
      </nb-option-list>
    </ng-template>

    <!-- Template for replacement mode (raw children, no wrapper) -->
    <ng-template #childrenContentTemplate>
      <ng-content select="nb-option, nb-option-nested"></ng-content>
    </ng-template>
  `,
  standalone: false,
})
export class NbOptionNestedComponent implements AfterContentInit, OnDestroy, NbFocusableOption, NbHighlightableOption {
  /**
   * Title displayed in the trigger row
   */
  @Input() title: string;

  /**
   * Custom icon for the nested option trigger
   */
  @Input() icon: string | undefined;

  /**
   * Icon pack for the custom icon
   */
  @Input() pack: string | undefined;

  /**
   * Disables the nested option
   */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = convertToBoolProperty(value);
  }
  protected _disabled: boolean = false;
  static ngAcceptInputType_disabled: NbBooleanInput;

  /**
   * Emitted when replacement mode is requested (not enough space for submenu)
   */
  @Output() replacementModeRequested = new EventEmitter<NbOptionNestedComponent>();

  /**
   * Emitted when the submenu is shown (for sibling coordination)
   */
  @Output() submenuShown = new EventEmitter<NbOptionNestedComponent>();

  /**
   * Template containing the child options with nb-option-list wrapper (for overlay submenu)
   */
  @ViewChild('childrenTemplate', { static: true }) childrenTemplate: TemplateRef<any>;

  /**
   * Template containing the raw child options without wrapper (for replacement mode)
   */
  @ViewChild('childrenContentTemplate', { static: true }) childrenContentTemplate: TemplateRef<any>;

  /**
   * Child option components
   */
  @ContentChildren(NbOptionComponent, { descendants: true }) options: QueryList<NbOptionComponent>;

  /**
   * Nested option children (for deep nesting)
   */
  @ContentChildren(NbOptionNestedComponent) nestedChildren: QueryList<NbOptionNestedComponent>;

  /**
   * Reference to the overlay search input element.
   */
  @ViewChild('overlaySearchInput') overlaySearchInput: ElementRef<HTMLInputElement>;

  /**
   * Current search term for overlay submenu.
   */
  overlaySearchTerm: string = '';

  /**
   * Filtered search results for overlay submenu.
   */
  overlaySearchResults: NbSearchableOption[] = [];

  /**
   * Index of currently active search result in overlay.
   */
  overlaySearchResultActiveIndex: number = -1;

  /**
   * Searchable index for overlay submenu.
   */
  protected overlaySearchableIndex: NbSearchableOption[] = [];

  /**
   * Whether overlay search mode is currently active.
   */
  get isOverlaySearching(): boolean {
    return this.searchable && this.overlaySearchTerm.length > 0;
  }

  /**
   * Whether search is enabled (from parent select).
   */
  get searchable(): boolean {
    return this.parent?.searchable ?? false;
  }

  /**
   * Search placeholder text - uses the nested option's title.
   */
  get searchPlaceholder(): string {
    return this.title;
  }

  /**
   * Empty search message (from parent select).
   */
  get searchEmptyMessage(): string {
    return this.parent?.searchEmptyMessage ?? 'No matching options';
  }

  protected parent: NbSelectComponent;
  protected destroy$ = new Subject<void>();
  protected overlayRef: NbOverlayRef | null = null;
  protected hoverShowTimeout: any;
  protected hoverHideTimeout: any;
  protected submenuVisible = false;
  protected submenuOpenedRight = true; // Track which direction the submenu opened
  protected submenuKeyManager: NbFocusKeyManager<NbFocusableOption> | null = null;
  protected keydownListener: ((event: KeyboardEvent) => void) | null = null;

  // Minimum width needed for submenu
  protected readonly SUBMENU_MIN_WIDTH = 200;
  // Delay before showing submenu on hover (ms)
  protected readonly HOVER_SHOW_DELAY = 150;
  // Delay before hiding submenu on mouse leave (ms)
  protected readonly HOVER_HIDE_DELAY = 100;

  @HostBinding('attr.disabled')
  get disabledAttribute(): '' | null {
    return this.disabled ? '' : null;
  }

  @HostBinding('class.submenu-open')
  get submenuOpen(): boolean {
    return this.submenuVisible;
  }

  @HostBinding('class.active')
  get activeClass(): boolean {
    return this._active;
  }
  protected _active: boolean = false;

  @HostBinding('class.has-selected-child')
  get hasSelectedChildClass(): boolean {
    return this._hasSelectedChild;
  }
  protected _hasSelectedChild: boolean = false;

  @HostBinding('class.multiple')
  get multipleClass(): boolean {
    return this.parent?.multiple ?? false;
  }

  @HostBinding('tabIndex')
  get tabindex(): string {
    return '-1';
  }

  constructor(
    @Optional() @Inject(NB_SELECT_INJECTION_TOKEN) parent: NbSelectComponent,
    @Inject(NB_DOCUMENT) protected document: Document,
    protected elementRef: ElementRef<HTMLElement>,
    protected cd: ChangeDetectorRef,
    protected zone: NgZone,
    protected renderer: Renderer2,
    protected overlay: NbOverlayService,
    protected positionBuilder: NbPositionBuilderService,
    protected viewContainerRef: ViewContainerRef,
    protected focusKeyManagerFactory: NbFocusKeyManagerFactoryService<NbFocusableOption>,
  ) {
    this.parent = parent;
  }

  ngAfterContentInit(): void {
    // Subscribe to child option clicks and propagate to parent select
    this.subscribeToChildOptionClicks();

    // Subscribe to selection changes to track if any child is selected
    this.subscribeToChildSelectionChanges();

    // Subscribe to child nested options' submenu shown events to close siblings
    this.subscribeToChildNestedSubmenuShown();

    // Re-subscribe when options change
    this.options.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.subscribeToChildOptionClicks();
      this.subscribeToChildSelectionChanges();
      this.updateHasSelectedChild();
    });

    // Re-subscribe when nested children change
    this.nestedChildren.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.subscribeToChildNestedSubmenuShown();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearTimeouts();
    this.hideSubmenu();
  }

  /**
   * Get size from parent select
   */
  get size(): NbComponentSize {
    return this.parent?.size || 'medium';
  }

  onMouseEnter(): void {
    if (this.disabled) {
      return;
    }

    this.clearTimeouts();

    if (this.hasSpaceForSubmenu()) {
      this.hoverShowTimeout = setTimeout(() => {
        this.showSubmenu();
      }, this.HOVER_SHOW_DELAY);
    }
  }

  onMouseLeave(): void {
    this.clearTimeouts();

    if (this.submenuVisible) {
      this.hoverHideTimeout = setTimeout(() => {
        // Don't close if a child nested option has its submenu open
        if (this.hasChildSubmenuOpen()) {
          return;
        }
        this.hideSubmenu();
      }, this.HOVER_HIDE_DELAY);
    }
  }

  onClick(event: Event): void {
    if (this.disabled) {
      return;
    }

    event.stopPropagation();

    // Only trigger replacement mode when there's no space for submenu
    // When there's space, hover handles opening/closing - click does nothing
    if (!this.hasSpaceForSubmenu()) {
      this.replacementModeRequested.emit(this);
    }
  }

  @HostListener('keydown.arrowright', ['$event'])
  onArrowRight(event: Event): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.hasSpaceForSubmenu()) {
      this.showSubmenu();
      // Focus search input or first option in submenu (keyboard navigation)
      if (this.searchable) {
        this.focusOverlaySearchInput();
      } else {
        this.focusFirstChildOption();
      }
    } else {
      this.replacementModeRequested.emit(this);
    }
  }

  @HostListener('keydown.arrowleft', ['$event'])
  onArrowLeft(event: Event): void {
    if (this.submenuVisible) {
      event.preventDefault();
      event.stopPropagation();
      this.hideSubmenu();
    }
  }

  @HostListener('keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.submenuVisible) {
      event.preventDefault();
      event.stopPropagation();
      this.hideSubmenu();
    }
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onEnterOrSpace(event: Event): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.hasSpaceForSubmenu()) {
      if (this.submenuVisible) {
        this.hideSubmenu();
      } else {
        this.showSubmenu();
        // Focus search input or first option (keyboard navigation)
        if (this.searchable) {
          this.focusOverlaySearchInput();
        } else {
          this.focusFirstChildOption();
        }
      }
    } else {
      this.replacementModeRequested.emit(this);
    }
  }

  /**
   * Focus this element (for keyboard navigation via NbFocusableOption)
   */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  /**
   * Focus this element and sync with the parent's key manager.
   * Use this when returning focus from a submenu to ensure keyboard navigation works.
   */
  protected focusAndSyncKeyManager(): void {
    this.focus();
    this.parent?.setKeyManagerActiveItem(this);
  }

  /**
   * Get the label for the option (for type-ahead in key manager)
   */
  getLabel(): string {
    return this.title || '';
  }

  /**
   * Set active styles (called by key manager when this item becomes active)
   */
  setActiveStyles(): void {
    this._active = true;
    this.cd.markForCheck();
  }

  /**
   * Set inactive styles (called by key manager when this item becomes inactive)
   */
  setInactiveStyles(): void {
    this._active = false;
    this.cd.markForCheck();
  }

  /**
   * Handle search input changes in overlay submenu.
   */
  onOverlaySearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.overlaySearchTerm = input.value;

    // Close any open child submenus when searching
    this.closeChildSubmenus();

    // Reset active index when search results change
    this.overlaySearchResultActiveIndex = -1;

    if (this.overlaySearchTerm) {
      if (this.overlaySearchableIndex.length === 0) {
        this.overlaySearchableIndex = this.buildOverlaySearchableIndex();
      }
      this.overlaySearchResults = this.filterOverlayOptions(this.overlaySearchTerm);
    } else {
      this.overlaySearchResults = [];
    }

    this.cd.markForCheck();
  }

  /**
   * Close all child nested option submenus.
   */
  protected closeChildSubmenus(): void {
    this.nestedChildren?.forEach((nested) => {
      if (nested !== this && nested.submenuOpen) {
        nested.hideSubmenu();
      }
    });
  }

  /**
   * Build searchable index for overlay submenu children.
   */
  protected buildOverlaySearchableIndex(): NbSearchableOption[] {
    const index: NbSearchableOption[] = [];

    // Get direct nested children (to exclude their options)
    const directNestedChildren = this.nestedChildren?.filter((n) => n !== this) ?? [];
    const deeplyNestedOptions = new Set<NbOptionComponent>();
    directNestedChildren.forEach((child) => {
      child.options?.forEach((opt) => deeplyNestedOptions.add(opt));
    });

    // Add direct child options
    this.options?.forEach((opt) => {
      if (!deeplyNestedOptions.has(opt)) {
        index.push({
          option: opt,
          label: opt.content,
          path: [],
          pathDisplay: opt.content,
          searchText: opt.content.toLowerCase().trim(),
        });
      }
    });

    // Recurse into nested children
    directNestedChildren.forEach((child) => {
      this.indexNestedOptionsForOverlay(child, [], index);
    });

    return index;
  }

  /**
   * Recursively index nested options for overlay search.
   */
  protected indexNestedOptionsForOverlay(
    nested: NbOptionNestedComponent,
    parentPath: string[],
    index: NbSearchableOption[],
  ): void {
    const currentPath = [...parentPath, nested.title];

    const directNestedChildren = nested.nestedChildren?.filter((n) => n !== nested) ?? [];
    const deeplyNestedOptions = new Set<NbOptionComponent>();
    directNestedChildren.forEach((child) => {
      child.options?.forEach((opt) => deeplyNestedOptions.add(opt));
    });

    nested.options?.forEach((opt) => {
      if (!deeplyNestedOptions.has(opt)) {
        index.push({
          option: opt,
          label: opt.content,
          path: currentPath,
          pathDisplay: [...currentPath, opt.content].join(' > '),
          searchText: [...currentPath, opt.content].join(' ').toLowerCase(),
        });
      }
    });

    directNestedChildren.forEach((child) => {
      this.indexNestedOptionsForOverlay(child, currentPath, index);
    });
  }

  /**
   * Filter overlay options by search term.
   */
  protected filterOverlayOptions(term: string): NbSearchableOption[] {
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) {
      return [];
    }
    return this.overlaySearchableIndex.filter((item) => item.searchText.includes(searchTerm));
  }

  /**
   * Select an option from overlay search results.
   */
  selectOverlaySearchResult(result: NbSearchableOption): void {
    // Trigger the click on the option
    result.option.onClick({ preventDefault: () => {} } as Event);
    // For single select, hide the submenu
    if (!this.parent?.multiple) {
      this.hideSubmenu();
    }
  }

  /**
   * Clear overlay search state.
   */
  protected clearOverlaySearch(): void {
    this.overlaySearchTerm = '';
    this.overlaySearchResults = [];
    this.overlaySearchResultActiveIndex = -1;
    if (this.overlaySearchInput?.nativeElement) {
      this.overlaySearchInput.nativeElement.value = '';
    }
  }

  /**
   * Handle keyboard events in overlay search input.
   */
  onOverlaySearchKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    // Stop propagation for ALL keys to prevent parent key manager's typeahead from intercepting
    event.stopPropagation();

    if (keyCode === DOWN_ARROW) {
      event.preventDefault();
      if (this.overlaySearchResults.length > 0) {
        // Navigate search results
        if (this.overlaySearchResultActiveIndex < this.overlaySearchResults.length - 1) {
          this.overlaySearchResultActiveIndex++;
        }
        this.focusOverlaySearchResult(this.overlaySearchResultActiveIndex);
        this.cd.markForCheck();
      } else if (!this.overlaySearchTerm && this.submenuKeyManager) {
        // No search term - navigate to first child option
        this.submenuKeyManager.setFirstItemActive();
        this.cd.markForCheck();
      }
    } else if (keyCode === UP_ARROW) {
      event.preventDefault();
      if (this.overlaySearchResultActiveIndex > 0) {
        this.overlaySearchResultActiveIndex--;
        this.focusOverlaySearchResult(this.overlaySearchResultActiveIndex);
        this.cd.markForCheck();
      } else if (this.overlaySearchResultActiveIndex === 0) {
        this.overlaySearchResultActiveIndex = -1;
        this.overlaySearchInput?.nativeElement?.focus();
        this.cd.markForCheck();
      }
    } else if (keyCode === ENTER) {
      event.preventDefault();
      if (
        this.overlaySearchResultActiveIndex >= 0 &&
        this.overlaySearchResultActiveIndex < this.overlaySearchResults.length
      ) {
        this.selectOverlaySearchResult(this.overlaySearchResults[this.overlaySearchResultActiveIndex]);
      }
    } else if (keyCode === ESCAPE) {
      event.preventDefault();
      if (this.overlaySearchTerm) {
        this.clearOverlaySearch();
        this.cd.markForCheck();
      } else {
        this.hideSubmenu();
        this.focusAndSyncKeyManager();
      }
    } else if (
      (keyCode === LEFT_ARROW && this.submenuOpenedRight) ||
      (keyCode === RIGHT_ARROW && !this.submenuOpenedRight)
    ) {
      event.preventDefault();
      this.hideSubmenu();
      this.focusAndSyncKeyManager();
    }
  }

  /**
   * Handle keyboard events on overlay search result items.
   */
  onOverlaySearchResultKeydown(event: KeyboardEvent, index: number): void {
    const keyCode = event.keyCode;

    // Stop propagation for ALL keys to prevent parent key manager's typeahead from intercepting
    event.stopPropagation();

    if (keyCode === DOWN_ARROW) {
      event.preventDefault();
      if (index < this.overlaySearchResults.length - 1) {
        this.overlaySearchResultActiveIndex = index + 1;
        this.focusOverlaySearchResult(this.overlaySearchResultActiveIndex);
      }
    } else if (keyCode === UP_ARROW) {
      event.preventDefault();
      if (index > 0) {
        this.overlaySearchResultActiveIndex = index - 1;
        this.focusOverlaySearchResult(this.overlaySearchResultActiveIndex);
      } else {
        this.overlaySearchResultActiveIndex = -1;
        this.overlaySearchInput?.nativeElement?.focus();
      }
    } else if (keyCode === ENTER || keyCode === SPACE) {
      event.preventDefault();
      this.selectOverlaySearchResult(this.overlaySearchResults[index]);
    } else if (keyCode === ESCAPE) {
      event.preventDefault();
      this.clearOverlaySearch();
      this.overlaySearchInput?.nativeElement?.focus();
      this.cd.markForCheck();
    } else if (
      (keyCode === LEFT_ARROW && this.submenuOpenedRight) ||
      (keyCode === RIGHT_ARROW && !this.submenuOpenedRight)
    ) {
      event.preventDefault();
      this.hideSubmenu();
      this.focusAndSyncKeyManager();
    }
  }

  /**
   * Focus an overlay search result by index.
   */
  protected focusOverlaySearchResult(index: number): void {
    if (this.overlayRef?.overlayElement) {
      const results = this.overlayRef.overlayElement.querySelectorAll('.overlay-search-result-item');
      if (results[index]) {
        (results[index] as HTMLElement).focus();
      }
    }
    this.cd.markForCheck();
  }

  /**
   * Handle mouse enter on overlay search result.
   */
  onOverlaySearchResultMouseEnter(index: number): void {
    this.overlaySearchResultActiveIndex = index;
    this.cd.markForCheck();
  }

  /**
   * Handle mouse enter on overlay option list (the submenu panel itself).
   * Focus the search input when the user moves their mouse INTO the submenu.
   * Note: This is different from hovering over the parent option - that triggers showSubmenu()
   * which does NOT auto-focus. Only entering the actual submenu panel focuses the search.
   */
  onOverlayMouseEnter(): void {
    if (this.searchable && this.overlaySearchInput?.nativeElement) {
      this.overlaySearchInput.nativeElement.focus();
    }
  }

  /**
   * Check if there's enough viewport space to show the submenu to the side
   */
  protected hasSpaceForSubmenu(): boolean {
    const triggerRect = this.elementRef.nativeElement.getBoundingClientRect();
    const viewportWidth = this.document.documentElement.clientWidth;

    // Check right side first, then left
    const spaceOnRight = viewportWidth - triggerRect.right;
    const spaceOnLeft = triggerRect.left;

    return spaceOnRight >= this.SUBMENU_MIN_WIDTH || spaceOnLeft >= this.SUBMENU_MIN_WIDTH;
  }

  /**
   * Show the submenu overlay
   */
  protected showSubmenu(): void {
    if (this.submenuVisible || this.disabled) {
      return;
    }

    // Build search index if searchable
    if (this.searchable) {
      this.overlaySearchableIndex = this.buildOverlaySearchableIndex();
    }

    this.createOverlay();
    this.submenuVisible = true;
    this.submenuShown.emit(this);
    this.cd.markForCheck();

    // Note: We don't auto-focus search input here.
    // Focus should only happen when entering via keyboard navigation (arrow right or enter/space).
  }

  /**
   * Focus the overlay search input element and set up the submenu key manager.
   */
  protected focusOverlaySearchInput(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!this.overlayRef?.overlayElement) {
          return;
        }

        // Focus the search input
        if (this.overlaySearchInput?.nativeElement) {
          this.overlaySearchInput.nativeElement.focus();
        }

        // Also set up the submenu key manager for navigating child options
        const focusableItems = this.getFocusableChildren();
        if (focusableItems.length > 0) {
          this.submenuKeyManager = this.focusKeyManagerFactory.create(focusableItems);

          // Set up keyboard listener on the overlay for non-search navigation
          if (!this.keydownListener) {
            this.keydownListener = (event: KeyboardEvent) => {
              this.handleSubmenuKeydown(event);
            };
            this.overlayRef.overlayElement.addEventListener('keydown', this.keydownListener);
          }
        }
      });
    });
  }

  /**
   * Hide the submenu overlay
   */
  hideSubmenu(): void {
    if (!this.submenuVisible) {
      return;
    }

    // First, close any child nested option submenus
    this.nestedChildren?.forEach((nested) => {
      if (nested !== this && nested.submenuOpen) {
        nested.hideSubmenu();
      }
    });

    // Clear search state
    this.clearOverlaySearch();
    this.overlaySearchableIndex = [];

    // Clean up keyboard listener
    if (this.keydownListener && this.overlayRef?.overlayElement) {
      this.overlayRef.overlayElement.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }

    // Destroy key manager
    this.submenuKeyManager = null;

    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }

    this.submenuVisible = false;
    this.cd.markForCheck();
  }

  /**
   * Create the overlay for the submenu
   */
  protected createOverlay(): void {
    const positionStrategy = this.positionBuilder
      .connectedTo(this.elementRef)
      .position(NbPosition.END_TOP)
      .adjustment(NbAdjustment.HORIZONTAL)
      .offset(0);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'nb-option-nested-panel',
    });

    // Create and attach the template portal
    const templatePortal = new NbTemplatePortal(this.childrenTemplate, this.viewContainerRef);
    this.overlayRef.attach(templatePortal);

    // Determine which direction the submenu opened after it's positioned
    requestAnimationFrame(() => {
      if (this.overlayRef?.overlayElement) {
        const triggerRect = this.elementRef.nativeElement.getBoundingClientRect();
        const overlayRect = this.overlayRef.overlayElement.getBoundingClientRect();
        // If overlay left edge is greater than trigger right edge, it opened to the right
        this.submenuOpenedRight = overlayRect.left >= triggerRect.right - 10; // Small tolerance for overlap
      }
    });

    // Handle mouse events on the overlay to prevent hiding
    this.overlayRef.overlayElement.addEventListener('mouseenter', () => {
      this.clearTimeouts();
    });

    this.overlayRef.overlayElement.addEventListener('mouseleave', () => {
      // Don't close if a child nested option has its submenu open
      // (user is navigating deeper into the menu tree)
      if (this.hasChildSubmenuOpen()) {
        return;
      }
      this.hoverHideTimeout = setTimeout(() => {
        this.hideSubmenu();
      }, this.HOVER_HIDE_DELAY);
    });
  }

  /**
   * Check if any direct child nested option has its submenu open
   */
  protected hasChildSubmenuOpen(): boolean {
    return this.nestedChildren?.some((nested) => nested !== this && nested.submenuOpen) ?? false;
  }

  /**
   * Subscribe to child option click events
   */
  protected subscribeToChildOptionClicks(): void {
    this.options.changes
      .pipe(
        startWith(this.options),
        switchMap((options: QueryList<NbOptionComponent>) => {
          return merge(...options.map((option) => option.click));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        // Only hide submenu for single-select mode
        // For multi-select, keep the submenu open to allow multiple selections
        if (!this.parent?.multiple) {
          this.hideSubmenu();
        }
      });
  }

  /**
   * Subscribe to child option selection changes to track if any child is selected
   */
  protected subscribeToChildSelectionChanges(): void {
    // Initial check
    this.updateHasSelectedChild();

    // Subscribe to selection changes
    this.options.changes
      .pipe(
        startWith(this.options),
        switchMap((options: QueryList<NbOptionComponent>) => {
          if (options.length === 0) {
            return [];
          }
          return merge(...options.map((option) => option.selectionChange));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.updateHasSelectedChild();
      });
  }

  /**
   * Subscribe to child nested options' submenu shown events.
   * When a child nested option shows its submenu, close its siblings' submenus.
   */
  protected subscribeToChildNestedSubmenuShown(): void {
    // Get only direct children (exclude self and deeply nested)
    const directChildren = this.nestedChildren?.filter((nested) => nested !== this) ?? [];
    if (directChildren.length === 0) {
      return;
    }

    merge(...directChildren.map((nested) => nested.submenuShown))
      .pipe(takeUntil(this.destroy$))
      .subscribe((shownNestedOption: NbOptionNestedComponent) => {
        // Close all other sibling nested options' submenus
        directChildren.forEach((nested) => {
          if (nested !== shownNestedOption && nested.submenuOpen) {
            nested.hideSubmenu();
          }
        });
      });
  }

  /**
   * Update the hasSelectedChild state based on current child options
   */
  protected updateHasSelectedChild(): void {
    this._hasSelectedChild = this.options?.some((option) => option.selected) ?? false;
    this.cd.markForCheck();
  }

  /**
   * Focus the first child option and set up keyboard navigation for the submenu
   */
  protected focusFirstChildOption(): void {
    // Use requestAnimationFrame to wait for the overlay to render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!this.overlayRef?.overlayElement) {
          return;
        }

        // Create key manager for child options
        const focusableItems = this.getFocusableChildren();
        if (focusableItems.length > 0) {
          this.submenuKeyManager = this.focusKeyManagerFactory.create(focusableItems);

          // Set up keyboard listener on the overlay
          this.keydownListener = (event: KeyboardEvent) => {
            this.handleSubmenuKeydown(event);
          };
          this.overlayRef.overlayElement.addEventListener('keydown', this.keydownListener);

          // Focus the first item
          this.submenuKeyManager.setFirstItemActive();
        }
      });
    });
  }

  /**
   * Get focusable children (options and nested options) for the submenu key manager
   */
  protected getFocusableChildren(): NbFocusableOption[] {
    const items: NbFocusableOption[] = [];

    // Get direct nested children (exclude self)
    const directNestedChildren = this.nestedChildren?.filter((nested) => nested !== this) ?? [];

    // Collect all options that belong to nested children (to exclude them)
    const deeplyNestedOptions = new Set<NbOptionComponent>();
    directNestedChildren.forEach((nested) => {
      nested.options?.forEach((opt) => deeplyNestedOptions.add(opt));
    });

    // Add only direct child options (not inside nested children)
    this.options?.forEach((option) => {
      if (!deeplyNestedOptions.has(option)) {
        items.push(option);
      }
    });

    // Add direct nested option triggers
    directNestedChildren.forEach((nested) => items.push(nested));

    // Sort items by DOM order
    items.sort((a, b) => {
      const aEl = (a as any).elementRef?.nativeElement;
      const bEl = (b as any).elementRef?.nativeElement;
      if (!aEl || !bEl) return 0;
      const position = aEl.compareDocumentPosition(bEl);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    return items;
  }

  /**
   * Handle keyboard events within the submenu
   */
  protected handleSubmenuKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    if (keyCode === ESCAPE) {
      event.preventDefault();
      event.stopPropagation();
      this.hideSubmenu();
      this.focusAndSyncKeyManager(); // Return focus to the trigger and sync key manager
      return;
    }

    // Arrow left closes submenu if it opened to the right
    // Arrow right closes submenu if it opened to the left
    if ((keyCode === LEFT_ARROW && this.submenuOpenedRight) || (keyCode === RIGHT_ARROW && !this.submenuOpenedRight)) {
      event.preventDefault();
      event.stopPropagation();
      this.hideSubmenu();
      this.focusAndSyncKeyManager(); // Return focus to the trigger and sync key manager
      return;
    }

    if (keyCode === UP_ARROW) {
      event.preventDefault();
      event.stopPropagation();
      // If searchable and at first item (or no active item), return to search input
      if (this.searchable && this.overlaySearchInput?.nativeElement) {
        const activeIndex = this.submenuKeyManager?.activeItemIndex ?? -1;
        if (activeIndex <= 0) {
          this.submenuKeyManager?.setActiveItem(-1);
          this.overlaySearchInput.nativeElement.focus();
          return;
        }
      }
      this.submenuKeyManager?.onKeydown(event);
      return;
    }

    if (keyCode === DOWN_ARROW) {
      event.preventDefault();
      event.stopPropagation();
      this.submenuKeyManager?.onKeydown(event);
      return;
    }

    if (keyCode === ENTER || keyCode === SPACE) {
      // Let the focused option handle Enter/Space
      // But stop propagation to prevent parent select from handling it
      event.stopPropagation();
      return;
    }
  }

  protected clearTimeouts(): void {
    if (this.hoverShowTimeout) {
      clearTimeout(this.hoverShowTimeout);
      this.hoverShowTimeout = null;
    }
    if (this.hoverHideTimeout) {
      clearTimeout(this.hoverHideTimeout);
      this.hoverHideTimeout = null;
    }
  }
}
