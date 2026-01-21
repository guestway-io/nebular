/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  SimpleChanges,
  OnChanges,
  Renderer2,
  NgZone,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject, BehaviorSubject, from } from 'rxjs';
import { startWith, switchMap, takeUntil, filter, map, finalize, take } from 'rxjs/operators';

import { NbStatusService } from '../../services/status.service';
import {
  NbAdjustableConnectedPositionStrategy,
  NbAdjustment,
  NbPosition,
  NbPositionBuilderService,
} from '../cdk/overlay/overlay-position';
import { NbOverlayRef, NbPortalDirective, NbScrollStrategy } from '../cdk/overlay/mapping';
import { NbOverlayService } from '../cdk/overlay/overlay-service';
import { NbTrigger, NbTriggerStrategy, NbTriggerStrategyBuilderService } from '../cdk/overlay/overlay-trigger';
import { NbFocusableOption, NbFocusKeyManager, NbFocusKeyManagerFactoryService } from '../cdk/a11y/focus-key-manager';
import { ESCAPE, LEFT_ARROW, DOWN_ARROW, UP_ARROW, ENTER, SPACE } from '../cdk/keycodes/keycodes';
import { NbComponentSize } from '../component-size';
import { NbComponentShape } from '../component-shape';
import { NbComponentOrCustomStatus } from '../component-status';
import { NB_DOCUMENT } from '../../theme.options';
import { NbOptionComponent } from '../option/option.component';
import { NbOptionNestedComponent } from '../option/option-nested.component';
import { convertToBoolProperty, NbBooleanInput } from '../helpers';
import { NB_SELECT_INJECTION_TOKEN } from './select-injection-tokens';
import { NbFormFieldControl, NbFormFieldControlConfig } from '../form-field/form-field-control';
import { NbFocusMonitor } from '../cdk/a11y/a11y.module';
import { NbScrollStrategies } from '../cdk/adapter/block-scroll-strategy-adapter';

export type NbSelectCompareFunction<T = any> = (v1: any, v2: any) => boolean;
export type NbSelectAppearance = 'outline' | 'filled' | 'hero';

/**
 * Interface for searchable option indexing.
 * Used to build a flat list of all options with their paths for search functionality.
 */
export interface NbSearchableOption {
  /** Reference to the option component */
  option: NbOptionComponent;
  /** The option's display label */
  label: string;
  /** Path segments from root to this option (parent titles) */
  path: string[];
  /** Full path display string including the option label */
  pathDisplay: string;
  /** Lowercase search text for matching (includes path and label) */
  searchText: string;
}

@Component({
  selector: 'nb-select-label',
  template: '<ng-content></ng-content>',
  standalone: false,
})
export class NbSelectLabelComponent {}

export function nbSelectFormFieldControlConfigFactory() {
  const config = new NbFormFieldControlConfig();
  config.supportsSuffix = false;
  return config;
}

/**
 * The `NbSelectComponent` provides a capability to select one of the passed items.
 *
 * @stacked-example(Showcase, select/select-showcase.component)
 *
 * ### Installation
 *
 * Import `NbSelectModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbSelectModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * If you want to use it as the multi-select control you have to mark it as `multiple`.
 * In this case, `nb-select` will work only with arrays - accept arrays and propagate arrays.
 *
 * @stacked-example(Multiple, select/select-multiple.component)
 *
 * Items without values will clean the selection. Both `null` and `undefined` values will also clean the selection.
 *
 * @stacked-example(Clean selection, select/select-clean.component)
 *
 * Select may be bounded using `selected` input:
 *
 * ```html
 * <nb-select [(selected)]="selected"></nb-selected>
 * ```
 *
 * Or you can bind control with form controls or ngModel:
 *
 * @stacked-example(Select form binding, select/select-form.component)
 *
 * Options in the select may be grouped using `nb-option-group` component.
 *
 * @stacked-example(Grouping, select/select-groups.component)
 *
 * Select may have a placeholder that will be shown when nothing selected:
 *
 * @stacked-example(Placeholder, select/select-placeholder.component)
 *
 * You can disable select, options and whole groups.
 *
 * @stacked-example(Disabled select, select/select-disabled.component)
 *
 * Also, the custom label may be provided in select.
 * This custom label will be used for instead placeholder when something selected.
 *
 * @stacked-example(Custom label, select/select-label.component)
 *
 * Default `nb-select` size is `medium` and status is `basic`.
 * Select is available in multiple colors using `status` property:
 *
 * @stacked-example(Select statuses, select/select-status.component)
 *
 * There are five select sizes:
 *
 * @stacked-example(Select sizes, select/select-sizes.component)
 *
 * And two additional style types - `filled`:
 *
 * @stacked-example(Filled select, select/select-filled.component)
 *
 * and `hero`:
 *
 * @stacked-example(Select colors, select/select-hero.component)
 *
 * Select is available in different shapes, that could be combined with the other properties:
 *
 * @stacked-example(Select shapes, select/select-shapes.component)
 *
 * By default, the component selects options whose values are strictly equal (`===`) with the select value.
 * To change such behavior, pass a custom comparator function to the `compareWith` attribute.
 *
 * @stacked-example(Select custom comparator, select/select-compare-with.component)
 *
 * You can add an additional icon to the select via the `nb-form-field` component:
 * @stacked-example(Select with icon, select/select-icon.component)
 *
 * @additional-example(Interactive, select/select-interactive.component)
 *
 * @styles
 *
 * select-cursor:
 * select-disabled-cursor:
 * select-min-width:
 * select-outline-width:
 * select-outline-color:
 * select-icon-offset:
 * select-text-font-family:
 * select-placeholder-text-font-family:
 * select-tiny-text-font-size:
 * select-tiny-text-font-weight:
 * select-tiny-text-line-height:
 * select-tiny-placeholder-text-font-size:
 * select-tiny-placeholder-text-font-weight:
 * select-tiny-max-width:
 * select-small-text-font-size:
 * select-small-text-font-weight:
 * select-small-text-line-height:
 * select-small-placeholder-text-font-size:
 * select-small-placeholder-text-font-weight:
 * select-small-max-width:
 * select-medium-text-font-size:
 * select-medium-text-font-weight:
 * select-medium-text-line-height:
 * select-medium-placeholder-text-font-size:
 * select-medium-placeholder-text-font-weight:
 * select-medium-max-width:
 * select-large-text-font-size:
 * select-large-text-font-weight:
 * select-large-text-line-height:
 * select-large-placeholder-text-font-size:
 * select-large-placeholder-text-font-weight:
 * select-large-max-width:
 * select-giant-text-font-size:
 * select-giant-text-font-weight:
 * select-giant-text-line-height:
 * select-giant-placeholder-text-font-size:
 * select-giant-placeholder-text-font-weight:
 * select-giant-max-width:
 * select-rectangle-border-radius:
 * select-semi-round-border-radius:
 * select-round-border-radius:
 * select-outline-border-style:
 * select-outline-border-width:
 * select-outline-tiny-padding:
 * select-outline-small-padding:
 * select-outline-medium-padding:
 * select-outline-large-padding:
 * select-outline-giant-padding:
 * select-outline-basic-icon-color:
 * select-outline-basic-text-color:
 * select-outline-basic-placeholder-text-color:
 * select-outline-basic-background-color:
 * select-outline-basic-border-color:
 * select-outline-basic-focus-background-color:
 * select-outline-basic-focus-border-color:
 * select-outline-basic-hover-background-color:
 * select-outline-basic-hover-border-color:
 * select-outline-basic-disabled-background-color:
 * select-outline-basic-disabled-border-color:
 * select-outline-basic-disabled-icon-color:
 * select-outline-basic-disabled-text-color:
 * select-outline-primary-icon-color:
 * select-outline-primary-text-color:
 * select-outline-primary-placeholder-text-color:
 * select-outline-primary-background-color:
 * select-outline-primary-border-color:
 * select-outline-primary-focus-background-color:
 * select-outline-primary-focus-border-color:
 * select-outline-primary-hover-background-color:
 * select-outline-primary-hover-border-color:
 * select-outline-primary-disabled-background-color:
 * select-outline-primary-disabled-border-color:
 * select-outline-primary-disabled-icon-color:
 * select-outline-primary-disabled-text-color:
 * select-outline-success-icon-color:
 * select-outline-success-text-color:
 * select-outline-success-placeholder-text-color:
 * select-outline-success-background-color:
 * select-outline-success-border-color:
 * select-outline-success-focus-background-color:
 * select-outline-success-focus-border-color:
 * select-outline-success-hover-background-color:
 * select-outline-success-hover-border-color:
 * select-outline-success-disabled-background-color:
 * select-outline-success-disabled-border-color:
 * select-outline-success-disabled-icon-color:
 * select-outline-success-disabled-text-color:
 * select-outline-info-icon-color:
 * select-outline-info-text-color:
 * select-outline-info-placeholder-text-color:
 * select-outline-info-background-color:
 * select-outline-info-border-color:
 * select-outline-info-focus-background-color:
 * select-outline-info-focus-border-color:
 * select-outline-info-hover-background-color:
 * select-outline-info-hover-border-color:
 * select-outline-info-disabled-background-color:
 * select-outline-info-disabled-border-color:
 * select-outline-info-disabled-icon-color:
 * select-outline-info-disabled-text-color:
 * select-outline-warning-icon-color:
 * select-outline-warning-text-color:
 * select-outline-warning-placeholder-text-color:
 * select-outline-warning-background-color:
 * select-outline-warning-border-color:
 * select-outline-warning-focus-background-color:
 * select-outline-warning-focus-border-color:
 * select-outline-warning-hover-background-color:
 * select-outline-warning-hover-border-color:
 * select-outline-warning-disabled-background-color:
 * select-outline-warning-disabled-border-color:
 * select-outline-warning-disabled-icon-color:
 * select-outline-warning-disabled-text-color:
 * select-outline-danger-icon-color:
 * select-outline-danger-text-color:
 * select-outline-danger-placeholder-text-color:
 * select-outline-danger-background-color:
 * select-outline-danger-border-color:
 * select-outline-danger-focus-background-color:
 * select-outline-danger-focus-border-color:
 * select-outline-danger-hover-background-color:
 * select-outline-danger-hover-border-color:
 * select-outline-danger-disabled-background-color:
 * select-outline-danger-disabled-border-color:
 * select-outline-danger-disabled-icon-color:
 * select-outline-danger-disabled-text-color:
 * select-outline-control-icon-color:
 * select-outline-control-text-color:
 * select-outline-control-placeholder-text-color:
 * select-outline-control-background-color:
 * select-outline-control-border-color:
 * select-outline-control-focus-background-color:
 * select-outline-control-focus-border-color:
 * select-outline-control-hover-background-color:
 * select-outline-control-hover-border-color:
 * select-outline-control-disabled-background-color:
 * select-outline-control-disabled-border-color:
 * select-outline-control-disabled-icon-color:
 * select-outline-control-disabled-text-color:
 * select-outline-adjacent-border-style:
 * select-outline-adjacent-border-width:
 * select-outline-basic-open-border-color:
 * select-outline-basic-adjacent-border-color:
 * select-outline-primary-open-border-color:
 * select-outline-primary-adjacent-border-color:
 * select-outline-success-open-border-color:
 * select-outline-success-adjacent-border-color:
 * select-outline-info-open-border-color:
 * select-outline-info-adjacent-border-color:
 * select-outline-warning-open-border-color:
 * select-outline-warning-adjacent-border-color:
 * select-outline-danger-open-border-color:
 * select-outline-danger-adjacent-border-color:
 * select-outline-control-open-border-color:
 * select-outline-control-adjacent-border-color:
 * select-filled-border-style:
 * select-filled-border-width:
 * select-filled-tiny-padding:
 * select-filled-small-padding:
 * select-filled-medium-padding:
 * select-filled-large-padding:
 * select-filled-giant-padding:
 * select-filled-basic-background-color:
 * select-filled-basic-border-color:
 * select-filled-basic-icon-color:
 * select-filled-basic-text-color:
 * select-filled-basic-placeholder-text-color:
 * select-filled-basic-focus-background-color:
 * select-filled-basic-focus-border-color:
 * select-filled-basic-hover-background-color:
 * select-filled-basic-hover-border-color:
 * select-filled-basic-disabled-background-color:
 * select-filled-basic-disabled-border-color:
 * select-filled-basic-disabled-icon-color:
 * select-filled-basic-disabled-text-color:
 * select-filled-primary-background-color:
 * select-filled-primary-border-color:
 * select-filled-primary-icon-color:
 * select-filled-primary-text-color:
 * select-filled-primary-placeholder-text-color:
 * select-filled-primary-focus-background-color:
 * select-filled-primary-focus-border-color:
 * select-filled-primary-hover-background-color:
 * select-filled-primary-hover-border-color:
 * select-filled-primary-disabled-background-color:
 * select-filled-primary-disabled-border-color:
 * select-filled-primary-disabled-icon-color:
 * select-filled-primary-disabled-text-color:
 * select-filled-success-background-color:
 * select-filled-success-border-color:
 * select-filled-success-icon-color:
 * select-filled-success-text-color:
 * select-filled-success-placeholder-text-color:
 * select-filled-success-focus-background-color:
 * select-filled-success-focus-border-color:
 * select-filled-success-hover-background-color:
 * select-filled-success-hover-border-color:
 * select-filled-success-disabled-background-color:
 * select-filled-success-disabled-border-color:
 * select-filled-success-disabled-icon-color:
 * select-filled-success-disabled-text-color:
 * select-filled-info-background-color:
 * select-filled-info-border-color:
 * select-filled-info-icon-color:
 * select-filled-info-text-color:
 * select-filled-info-placeholder-text-color:
 * select-filled-info-focus-background-color:
 * select-filled-info-focus-border-color:
 * select-filled-info-hover-background-color:
 * select-filled-info-hover-border-color:
 * select-filled-info-disabled-background-color:
 * select-filled-info-disabled-border-color:
 * select-filled-info-disabled-icon-color:
 * select-filled-info-disabled-text-color:
 * select-filled-warning-background-color:
 * select-filled-warning-border-color:
 * select-filled-warning-icon-color:
 * select-filled-warning-text-color:
 * select-filled-warning-placeholder-text-color:
 * select-filled-warning-focus-background-color:
 * select-filled-warning-focus-border-color:
 * select-filled-warning-hover-background-color:
 * select-filled-warning-hover-border-color:
 * select-filled-warning-disabled-background-color:
 * select-filled-warning-disabled-border-color:
 * select-filled-warning-disabled-icon-color:
 * select-filled-warning-disabled-text-color:
 * select-filled-danger-background-color:
 * select-filled-danger-border-color:
 * select-filled-danger-icon-color:
 * select-filled-danger-text-color:
 * select-filled-danger-placeholder-text-color:
 * select-filled-danger-focus-background-color:
 * select-filled-danger-focus-border-color:
 * select-filled-danger-hover-background-color:
 * select-filled-danger-hover-border-color:
 * select-filled-danger-disabled-background-color:
 * select-filled-danger-disabled-border-color:
 * select-filled-danger-disabled-icon-color:
 * select-filled-danger-disabled-text-color:
 * select-filled-control-background-color:
 * select-filled-control-border-color:
 * select-filled-control-icon-color:
 * select-filled-control-text-color:
 * select-filled-control-placeholder-text-color:
 * select-filled-control-focus-background-color:
 * select-filled-control-focus-border-color:
 * select-filled-control-hover-background-color:
 * select-filled-control-hover-border-color:
 * select-filled-control-disabled-background-color:
 * select-filled-control-disabled-border-color:
 * select-filled-control-disabled-icon-color:
 * select-filled-control-disabled-text-color:
 * select-hero-tiny-padding:
 * select-hero-small-padding:
 * select-hero-medium-padding:
 * select-hero-large-padding:
 * select-hero-giant-padding:
 * select-hero-basic-left-background-color:
 * select-hero-basic-right-background-color:
 * select-hero-basic-icon-color:
 * select-hero-basic-text-color:
 * select-hero-basic-placeholder-text-color:
 * select-hero-basic-focus-left-background-color:
 * select-hero-basic-focus-right-background-color:
 * select-hero-basic-hover-left-background-color:
 * select-hero-basic-hover-right-background-color:
 * select-hero-basic-disabled-background-color:
 * select-hero-basic-disabled-icon-color:
 * select-hero-basic-disabled-text-color:
 * select-hero-primary-left-background-color:
 * select-hero-primary-right-background-color:
 * select-hero-primary-icon-color:
 * select-hero-primary-text-color:
 * select-hero-primary-placeholder-text-color:
 * select-hero-primary-focus-left-background-color:
 * select-hero-primary-focus-right-background-color:
 * select-hero-primary-hover-left-background-color:
 * select-hero-primary-hover-right-background-color:
 * select-hero-primary-disabled-background-color:
 * select-hero-primary-disabled-icon-color:
 * select-hero-primary-disabled-text-color:
 * select-hero-success-left-background-color:
 * select-hero-success-right-background-color:
 * select-hero-success-icon-color:
 * select-hero-success-text-color:
 * select-hero-success-placeholder-text-color:
 * select-hero-success-focus-left-background-color:
 * select-hero-success-focus-right-background-color:
 * select-hero-success-hover-left-background-color:
 * select-hero-success-hover-right-background-color:
 * select-hero-success-disabled-background-color:
 * select-hero-success-disabled-icon-color:
 * select-hero-success-disabled-text-color:
 * select-hero-info-left-background-color:
 * select-hero-info-right-background-color:
 * select-hero-info-icon-color:
 * select-hero-info-text-color:
 * select-hero-info-placeholder-text-color:
 * select-hero-info-focus-left-background-color:
 * select-hero-info-focus-right-background-color:
 * select-hero-info-hover-left-background-color:
 * select-hero-info-hover-right-background-color:
 * select-hero-info-disabled-background-color:
 * select-hero-info-disabled-icon-color:
 * select-hero-info-disabled-text-color:
 * select-hero-warning-left-background-color:
 * select-hero-warning-right-background-color:
 * select-hero-warning-icon-color:
 * select-hero-warning-text-color:
 * select-hero-warning-placeholder-text-color:
 * select-hero-warning-focus-left-background-color:
 * select-hero-warning-focus-right-background-color:
 * select-hero-warning-hover-left-background-color:
 * select-hero-warning-hover-right-background-color:
 * select-hero-warning-disabled-background-color:
 * select-hero-warning-disabled-icon-color:
 * select-hero-warning-disabled-text-color:
 * select-hero-danger-left-background-color:
 * select-hero-danger-right-background-color:
 * select-hero-danger-icon-color:
 * select-hero-danger-text-color:
 * select-hero-danger-placeholder-text-color:
 * select-hero-danger-focus-left-background-color:
 * select-hero-danger-focus-right-background-color:
 * select-hero-danger-hover-left-background-color:
 * select-hero-danger-hover-right-background-color:
 * select-hero-danger-disabled-background-color:
 * select-hero-danger-disabled-icon-color:
 * select-hero-danger-disabled-text-color:
 * select-hero-control-left-background-color:
 * select-hero-control-right-background-color:
 * select-hero-control-icon-color:
 * select-hero-control-text-color:
 * select-hero-control-placeholder-text-color:
 * select-hero-control-focus-left-background-color:
 * select-hero-control-focus-right-background-color:
 * select-hero-control-hover-left-background-color:
 * select-hero-control-hover-right-background-color:
 * select-hero-control-disabled-background-color:
 * select-hero-control-disabled-icon-color:
 * select-hero-control-disabled-text-color:
 * */
@Component({
  selector: 'nb-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NbSelectComponent),
      multi: true,
    },
    { provide: NB_SELECT_INJECTION_TOKEN, useExisting: NbSelectComponent },
    { provide: NbFormFieldControl, useExisting: NbSelectComponent },
    { provide: NbFormFieldControlConfig, useFactory: nbSelectFormFieldControlConfigFactory },
  ],
  standalone: false,
})
export class NbSelectComponent
  implements OnChanges, AfterViewInit, AfterContentInit, OnDestroy, ControlValueAccessor, NbFormFieldControl
{
  /**
   * Select size, available sizes:
   * `tiny`, `small`, `medium` (default), `large`, `giant`
   */
  @Input() size: NbComponentSize = 'medium';

  /**
   * Select status (adds specific styles):
   * `basic`, `primary`, `info`, `success`, `warning`, `danger`, `control`
   */
  @Input() status: NbComponentOrCustomStatus = 'basic';

  /**
   * Select shapes: `rectangle` (default), `round`, `semi-round`
   */
  @Input() shape: NbComponentShape = 'rectangle';

  /**
   * Select appearances: `outline` (default), `filled`, `hero`
   */
  @Input() appearance: NbSelectAppearance = 'outline';

  /**
   * Specifies class to be set on `nb-option`s container (`nb-option-list`)
   * */
  @Input() optionsListClass: NgClass['ngClass'];

  /**
   * Specifies class for the overlay panel with options
   * */
  @Input() optionsPanelClass: string | string[];

  /**
   * Specifies width (in pixels) to be set on `nb-option`s container (`nb-option-list`)
   * */
  @Input()
  get optionsWidth(): number {
    return this._optionsWidth ?? this.hostWidth;
  }
  set optionsWidth(value: number) {
    this._optionsWidth = value;
  }
  protected _optionsWidth: number | undefined;

  /**
   * Adds `outline` styles
   */
  @Input()
  @HostBinding('class.appearance-outline')
  get outline(): boolean {
    return this.appearance === 'outline';
  }
  set outline(value: boolean) {
    if (convertToBoolProperty(value)) {
      this.appearance = 'outline';
    }
  }
  static ngAcceptInputType_outline: NbBooleanInput;

  /**
   * Adds `filled` styles
   */
  @Input()
  @HostBinding('class.appearance-filled')
  get filled(): boolean {
    return this.appearance === 'filled';
  }
  set filled(value: boolean) {
    if (convertToBoolProperty(value)) {
      this.appearance = 'filled';
    }
  }
  static ngAcceptInputType_filled: NbBooleanInput;

  /**
   * Adds `hero` styles
   */
  @Input()
  @HostBinding('class.appearance-hero')
  get hero(): boolean {
    return this.appearance === 'hero';
  }
  set hero(value: boolean) {
    if (convertToBoolProperty(value)) {
      this.appearance = 'hero';
    }
  }
  static ngAcceptInputType_hero: NbBooleanInput;

  /**
   * Disables the select
   */
  @Input()
  get disabled(): boolean {
    return !!this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = convertToBoolProperty(value);
  }
  protected _disabled: boolean;
  static ngAcceptInputType_disabled: NbBooleanInput;

  /**
   * If set element will fill its container
   */
  @Input()
  @HostBinding('class.full-width')
  get fullWidth(): boolean {
    return this._fullWidth;
  }
  set fullWidth(value: boolean) {
    this._fullWidth = convertToBoolProperty(value);
  }
  protected _fullWidth: boolean = false;
  static ngAcceptInputType_fullWidth: NbBooleanInput;

  /**
   * Renders select placeholder if nothing selected.
   * */
  @Input() placeholder: string = '';

  /**
   * A function to compare option value with selected value.
   * By default, values are compared with strict equality (`===`).
   */
  @Input()
  get compareWith(): NbSelectCompareFunction {
    return this._compareWith;
  }
  set compareWith(fn: NbSelectCompareFunction) {
    if (typeof fn !== 'function') {
      return;
    }

    this._compareWith = fn;

    if (this.selectionModel.length && this.canSelectValue()) {
      this.setSelection(this.selected);
    }
  }
  protected _compareWith: NbSelectCompareFunction = (v1: any, v2: any) => v1 === v2;

  /**
   * Accepts selected item or array of selected items.
   * */
  @Input()
  set selected(value) {
    this.writeValue(value);
  }
  get selected() {
    return this.multiple ? this.selectionModel.map((o) => o.value) : this.selectionModel[0].value;
  }

  /**
   * Gives capability just write `multiple` over the element.
   * */
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    this._multiple = convertToBoolProperty(value);
  }
  protected _multiple: boolean = false;
  static ngAcceptInputType_multiple: NbBooleanInput;

  /**
   * Determines options overlay offset top (in pixels).
   **/
  @Input() optionsOverlayOffsetTop = 8;
  /**
   * Determines options overlay offset left (in pixels).
   **/
  @Input() optionsOverlayOffsetLeft = 0;
  /**
   * Determines options overlay position (defaults to bottom).
   **/
  @Input() optionsOverlayPosition = NbPosition.BOTTOM;
  /**
   * Determines options overlay scroll strategy.
   **/
  @Input() scrollStrategy: NbScrollStrategies = 'block';

  /**
   * Enables search input in the dropdown header.
   * When enabled, users can filter options by typing.
   */
  @Input()
  get searchable(): boolean {
    return this._searchable;
  }
  set searchable(value: boolean) {
    this._searchable = convertToBoolProperty(value);
  }
  protected _searchable: boolean = false;
  static ngAcceptInputType_searchable: NbBooleanInput;

  /**
   * Placeholder text for the search input.
   */
  @Input() searchPlaceholder: string = 'Search...';

  /**
   * Empty state message shown when search has no results.
   */
  @Input() searchEmptyMessage: string = 'No matching options';

  @HostBinding('class')
  get additionalClasses(): string[] {
    if (this.statusService.isCustomStatus(this.status)) {
      return [this.statusService.getStatusClass(this.status)];
    }
    return [];
  }

  /**
   * Will be emitted when selected value changes.
   * */
  @Output() selectedChange: EventEmitter<any> = new EventEmitter();

  /**
   * List of `NbOptionComponent`'s components passed as content.
   * TODO maybe it would be better provide wrapper
   * */
  @ContentChildren(NbOptionComponent, { descendants: true }) options: QueryList<NbOptionComponent>;

  /**
   * List of `NbOptionNestedComponent`'s components passed as content.
   * */
  @ContentChildren(NbOptionNestedComponent) nestedOptions: QueryList<NbOptionNestedComponent>;

  /**
   * Custom select label, will be rendered instead of default enumeration with coma.
   * */
  @ContentChild(NbSelectLabelComponent) customLabel;

  /**
   * NbCard with options content.
   * */
  @ViewChild(NbPortalDirective) portal: NbPortalDirective;

  @ViewChild('selectButton', { read: ElementRef }) button: ElementRef<HTMLButtonElement>;

  /**
   * Reference to the search input element.
   */
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  /**
   * Determines is select opened.
   * */
  @HostBinding('class.open')
  get isOpen(): boolean {
    return this.ref && this.ref.hasAttached();
  }

  /**
   * List of selected options.
   * */
  selectionModel: NbOptionComponent[] = [];

  /**
   * Current search term entered by user.
   */
  searchTerm: string = '';

  /**
   * Filtered search results based on current search term.
   */
  searchResults: NbSearchableOption[] = [];

  /**
   * Flat index of all searchable options with their paths.
   */
  protected searchableIndex: NbSearchableOption[] = [];

  /**
   * Whether search mode is currently active (has search term).
   */
  get isSearching(): boolean {
    return this.searchable && this.searchTerm.length > 0;
  }

  /**
   * Index of the currently active/highlighted search result.
   */
  searchResultActiveIndex: number = -1;

  /**
   * Current search term for replacement mode (nested level).
   */
  nestedSearchTerm: string = '';

  /**
   * Filtered search results for replacement mode.
   */
  nestedSearchResults: NbSearchableOption[] = [];

  /**
   * Index of currently active search result in replacement mode.
   */
  nestedSearchResultActiveIndex: number = -1;

  /**
   * Searchable index for replacement mode (built from active nested option's children).
   */
  protected nestedSearchableIndex: NbSearchableOption[] = [];

  /**
   * Reference to the nested search input element.
   */
  @ViewChild('nestedSearchInput') nestedSearchInput: ElementRef<HTMLInputElement>;

  /**
   * Whether nested search mode is currently active (has search term in replacement mode).
   */
  get isNestedSearching(): boolean {
    return this.searchable && this.activeNestedOption !== null && this.nestedSearchTerm.length > 0;
  }

  positionStrategy: NbAdjustableConnectedPositionStrategy;

  /**
   * Current overlay position because of we have to toggle overlayPosition
   * in [ngClass] direction and this directive can use only string.
   */
  overlayPosition: NbPosition = '' as NbPosition;

  protected ref: NbOverlayRef;

  protected triggerStrategy: NbTriggerStrategy;

  protected alive: boolean = true;

  protected destroy$ = new Subject<void>();

  /**
   * Subject to unsubscribe from nested option events when exiting replacement mode
   */
  protected replacementModeDestroy$ = new Subject<void>();

  protected keyManager: NbFocusKeyManager<NbFocusableOption>;

  /**
   * If a user assigns value before content nb-options's rendered the value will be putted in this variable.
   * And then applied after content rendered.
   * Only the last value will be applied.
   * */
  protected queue;

  /**
   * Function passed through control value accessor to propagate changes.
   * */
  protected onChange: Function = () => {};
  protected onTouched: Function = () => {};

  /*
   * @docs-private
   **/
  status$ = new BehaviorSubject<NbComponentOrCustomStatus>(this.status);

  /*
   * @docs-private
   **/
  size$ = new BehaviorSubject<NbComponentSize>(this.size);

  /*
   * @docs-private
   **/
  focused$ = new BehaviorSubject<boolean>(false);

  /*
   * @docs-private
   **/
  disabled$ = new BehaviorSubject<boolean>(this.disabled);

  /*
   * @docs-private
   **/
  fullWidth$ = new BehaviorSubject<boolean>(this.fullWidth);

  /**
   * Currently active nested option in replacement mode.
   * When set, the main options are hidden and nested children are shown.
   * */
  activeNestedOption: NbOptionNestedComponent | null = null;

  /**
   * Stack of nested options for deep nesting navigation.
   * Allows navigating back through multiple levels.
   * */
  protected nestedOptionStack: NbOptionNestedComponent[] = [];

  constructor(
    @Inject(NB_DOCUMENT) protected document,
    protected overlay: NbOverlayService,
    protected hostRef: ElementRef<HTMLElement>,
    protected positionBuilder: NbPositionBuilderService,
    protected triggerStrategyBuilder: NbTriggerStrategyBuilderService,
    protected cd: ChangeDetectorRef,
    protected focusKeyManagerFactoryService: NbFocusKeyManagerFactoryService<NbFocusableOption>,
    protected focusMonitor: NbFocusMonitor,
    protected renderer: Renderer2,
    protected zone: NgZone,
    protected statusService: NbStatusService,
  ) {}

  /**
   * Determines is select hidden.
   * */
  get isHidden(): boolean {
    return !this.isOpen;
  }

  /**
   * Returns width of the select button.
   * */
  get hostWidth(): number {
    return this.button.nativeElement.getBoundingClientRect().width;
  }

  get selectButtonClasses(): string[] {
    const classes = [];

    if (!this.selectionModel.length) {
      classes.push('placeholder');
    }
    if (!this.selectionModel.length && !this.placeholder) {
      classes.push('empty');
    }
    if (this.isOpen) {
      classes.push(this.overlayPosition);
    }

    return classes;
  }

  /**
   * Content rendered in the label.
   * */
  get selectionView() {
    if (this.selectionModel.length > 1) {
      return this.selectionModel.map((option: NbOptionComponent) => option.content).join(', ');
    }

    return this.selectionModel[0].content;
  }

  ngOnChanges({ disabled, status, size, fullWidth }: SimpleChanges) {
    if (disabled) {
      this.disabled$.next(disabled.currentValue);
    }
    if (status) {
      this.status$.next(status.currentValue);
    }
    if (size) {
      this.size$.next(size.currentValue);
    }
    if (fullWidth) {
      this.fullWidth$.next(this.fullWidth);
    }
  }

  ngAfterContentInit() {
    this.options.changes
      .pipe(
        startWith(this.options),
        filter(() => this.canSelectValue()),
        // Call 'writeValue' when current change detection run is finished.
        // When writing is finished, change detection starts again, since
        // microtasks queue is empty.
        // Prevents ExpressionChangedAfterItHasBeenCheckedError.
        switchMap((options: QueryList<NbOptionComponent>) => from(Promise.resolve(options))),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        if (this.queue != null) {
          this.writeValue(this.queue);
        } else if (this.selectionModel.length) {
          // Re-sync selection model with new option components when options change.
          // This handles the case where option components are replaced (e.g., via *ngFor)
          // but the selected value should remain the same.
          const currentValues = this.multiple ? this.selectionModel.map((o) => o.value) : this.selectionModel[0]?.value;
          this.setSelection(currentValues);
        }
      });
  }

  ngAfterViewInit() {
    this.triggerStrategy = this.createTriggerStrategy();

    this.subscribeOnButtonFocus();
    this.subscribeOnTriggers();
    this.subscribeOnOptionClick();
    this.subscribeOnNestedOptionReplacementMode();
    this.subscribeOnNestedOptionSubmenuShown();

    // TODO: #2254
    this.zone.runOutsideAngular(() =>
      setTimeout(() => {
        this.renderer.addClass(this.hostRef.nativeElement, 'nb-transition');
      }),
    );
  }

  ngOnDestroy() {
    this.alive = false;

    this.destroy$.next();
    this.destroy$.complete();
    this.replacementModeDestroy$.next();
    this.replacementModeDestroy$.complete();

    if (this.ref) {
      this.ref.dispose();
    }
    if (this.triggerStrategy) {
      this.triggerStrategy.destroy();
    }
  }

  show() {
    if (this.shouldShow()) {
      this.attachToOverlay();

      // Build search index when opening if searchable
      if (this.searchable) {
        this.searchableIndex = this.buildSearchableOptionsIndex();
      }

      this.positionStrategy.positionChange.pipe(take(1), takeUntil(this.destroy$)).subscribe(() => {
        if (this.searchable) {
          // Focus search input after overlay is positioned
          this.focusSearchInput();
        } else {
          this.setActiveOption();
        }
      });

      this.cd.markForCheck();
    }
  }

  hide() {
    if (this.isOpen) {
      // Close all nested option submenus first
      this.closeAllNestedSubmenus();
      this.ref.detach();
      // Fully reset replacement mode state (not just one level)
      this.resetReplacementMode();
      // Clear search state on close
      this.clearSearch();
      this.cd.markForCheck();
    }
  }

  /**
   * Focus the search input element.
   */
  protected focusSearchInput(): void {
    requestAnimationFrame(() => {
      if (this.searchInput?.nativeElement) {
        this.searchInput.nativeElement.focus();
      }
    });
  }

  /**
   * Fully reset replacement mode state - clears all levels
   */
  protected resetReplacementMode(): void {
    this.replacementModeDestroy$.next();
    this.activeNestedOption = null;
    this.nestedOptionStack = [];
  }

  /**
   * Close all nested option overlay submenus
   */
  protected closeAllNestedSubmenus(): void {
    this.nestedOptions?.forEach((nested) => {
      if (nested.submenuOpen) {
        nested.hideSubmenu();
      }
    });
  }

  /**
   * Enter replacement mode for a nested option.
   * Hides main options and shows the nested option's children.
   * */
  enterReplacementMode(nestedOption: NbOptionNestedComponent): void {
    // Unsubscribe from previous replacement mode subscriptions
    this.replacementModeDestroy$.next();

    // Clear any existing nested search state
    this.clearNestedSearch();

    if (this.activeNestedOption) {
      this.nestedOptionStack.push(this.activeNestedOption);
    }
    this.activeNestedOption = nestedOption;
    this.cd.markForCheck();

    // Build nested search index if searchable
    if (this.searchable) {
      this.nestedSearchableIndex = this.buildNestedSearchableIndex(nestedOption);
    }

    // Update key manager to use the nested option's children
    this.updateKeyManagerForReplacementMode(nestedOption);

    // Subscribe to the nested children's replacement mode requests (for deeper nesting)
    this.subscribeToNestedChildrenReplacementMode(nestedOption);

    // Focus the search input or first option in the replacement view after it renders
    if (this.searchable) {
      this.focusNestedSearchInput();
    } else {
      this.focusFirstReplacementOption();
    }
  }

  /**
   * Focus the nested search input element.
   */
  protected focusNestedSearchInput(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.nestedSearchInput?.nativeElement) {
          this.nestedSearchInput.nativeElement.focus();
        }
      });
    });
  }

  /**
   * Subscribe to nested children's replacement mode requests when in replacement mode.
   * This enables keyboard navigation to deeper nesting levels.
   */
  protected subscribeToNestedChildrenReplacementMode(nestedOption: NbOptionNestedComponent): void {
    const directNestedChildren = nestedOption.nestedChildren?.filter((nested) => nested !== nestedOption) ?? [];
    if (directNestedChildren.length === 0) {
      return;
    }

    merge(...directNestedChildren.map((nested) => nested.replacementModeRequested))
      .pipe(takeUntil(this.replacementModeDestroy$), takeUntil(this.destroy$))
      .subscribe((childNestedOption: NbOptionNestedComponent) => {
        this.enterReplacementMode(childNestedOption);
      });
  }

  /**
   * Update the key manager to use the nested option's children for keyboard navigation
   */
  protected updateKeyManagerForReplacementMode(nestedOption: NbOptionNestedComponent): void {
    const childItems: NbFocusableOption[] = [];

    // Get direct nested option children (exclude self, filter to direct children only)
    const directNestedChildren = nestedOption.nestedChildren?.filter((nested) => nested !== nestedOption) ?? [];

    // Collect all options that belong to deeper nested levels (to exclude them)
    const deeplyNestedOptions = new Set<NbOptionComponent>();
    directNestedChildren.forEach((nested) => {
      nested.options?.forEach((opt) => deeplyNestedOptions.add(opt));
    });

    // Add only direct child options (those not inside a nested child)
    nestedOption.options?.forEach((option) => {
      if (!deeplyNestedOptions.has(option)) {
        childItems.push(option);
      }
    });

    // Add direct nested option triggers
    directNestedChildren.forEach((nested) => childItems.push(nested));

    // Sort items by DOM order to ensure keyboard navigation matches visual order
    // Only include items that are currently in the DOM
    const itemsInDom = childItems.filter((item) => {
      const el = (item as any).elementRef?.nativeElement;
      return el && document.body.contains(el);
    });

    itemsInDom.sort((a, b) => {
      const aEl = (a as any).elementRef?.nativeElement;
      const bEl = (b as any).elementRef?.nativeElement;
      if (!aEl || !bEl) return 0;
      const position = aEl.compareDocumentPosition(bEl);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    // Use filtered and sorted items, or fall back to original if none are in DOM
    const finalItems = itemsInDom.length > 0 ? itemsInDom : childItems;

    // Recreate key manager with the sorted items
    this.keyManager = this.focusKeyManagerFactoryService.create(finalItems).withTypeAhead(200);

    // Set the first item as active so arrow navigation works immediately
    if (finalItems.length > 0) {
      this.keyManager.setFirstItemActive();
    }
  }

  /**
   * Focus the first option in the replacement mode view
   */
  protected focusFirstReplacementOption(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.activeNestedOption && this.ref?.overlayElement) {
          // Re-create key manager AFTER DOM is rendered to ensure items are correct
          this.updateKeyManagerForReplacementMode(this.activeNestedOption);

          // Query for options within the option-list, excluding the back header
          const optionList = this.ref.overlayElement.querySelector('nb-option-list');
          if (optionList) {
            const firstOption = optionList.querySelector('nb-option, nb-option-nested') as HTMLElement;
            if (firstOption) {
              firstOption.focus();
            }
          }
        }
      });
    });
  }

  /**
   * Exit replacement mode, returning to the previous level or main options.
   * */
  exitReplacementMode(): void {
    // Unsubscribe from current level's nested children events
    this.replacementModeDestroy$.next();

    // Clear nested search state
    this.clearNestedSearch();

    if (this.nestedOptionStack.length > 0) {
      this.activeNestedOption = this.nestedOptionStack.pop() || null;
      if (this.activeNestedOption) {
        // Re-subscribe to the previous level's nested children events
        this.subscribeToNestedChildrenReplacementMode(this.activeNestedOption);
        // Rebuild search index for the previous level
        if (this.searchable) {
          this.nestedSearchableIndex = this.buildNestedSearchableIndex(this.activeNestedOption);
        }
      }
    } else {
      this.activeNestedOption = null;
    }
    this.cd.markForCheck();

    // Update key manager AFTER DOM renders and focus appropriate element
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.activeNestedOption) {
          this.updateKeyManagerForReplacementMode(this.activeNestedOption);
          if (this.searchable) {
            this.focusNestedSearchInput();
          }
        } else {
          this.restoreTopLevelKeyManager();
          if (this.searchable) {
            this.focusSearchInput();
          }
        }
      });
    });
  }

  /**
   * Restore the key manager to use top-level focusable items
   */
  protected restoreTopLevelKeyManager(): void {
    const focusableItems = this.getFocusableItems();
    this.keyManager = this.focusKeyManagerFactoryService.create(focusableItems).withTypeAhead(200);
  }

  /**
   * Fully exit replacement mode, returning to main options.
   * */
  exitAllReplacementModes(): void {
    this.activeNestedOption = null;
    this.nestedOptionStack = [];
    this.cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cd.markForCheck();
  }

  writeValue(value): void {
    if (!this.alive) {
      return;
    }

    if (this.canSelectValue()) {
      this.setSelection(value);
      if (this.selectionModel.length) {
        this.queue = null;
      } else if (value != null) {
        // Value not found in current options, queue for retry when options change
        this.queue = value;
      }
    } else {
      this.queue = value;
    }
  }

  /**
   * Selects option or clear all selected options if value is null.
   * */
  protected handleOptionClick(option: NbOptionComponent) {
    this.queue = null;
    if (option.value == null) {
      this.reset();
    } else {
      this.selectOption(option);
    }

    this.cd.markForCheck();
  }

  /**
   * Deselect all selected options.
   * */
  protected reset() {
    this.selectionModel.forEach((option: NbOptionComponent) => option.deselect());
    this.selectionModel = [];
    this.hide();
    this.button.nativeElement.focus();
    this.emitSelected(this.multiple ? [] : null);
  }

  /**
   * Determines how to select option as multiple or single.
   * */
  protected selectOption(option: NbOptionComponent) {
    if (this.multiple) {
      this.handleMultipleSelect(option);
    } else {
      this.handleSingleSelect(option);
    }
  }

  /**
   * Select single option.
   * */
  protected handleSingleSelect(option: NbOptionComponent) {
    const selected = this.selectionModel.pop();

    if (selected && !this._compareWith(selected.value, option.value)) {
      selected.deselect();
    }

    this.selectionModel = [option];
    option.select();
    this.hide();
    this.button.nativeElement.focus();

    this.emitSelected(option.value);
  }

  /**
   * Select for multiple options.
   * */
  protected handleMultipleSelect(option: NbOptionComponent) {
    if (option.selected) {
      this.selectionModel = this.selectionModel.filter((s) => !this._compareWith(s.value, option.value));
      option.deselect();
    } else {
      this.selectionModel.push(option);
      option.select();
    }

    this.emitSelected(this.selectionModel.map((opt: NbOptionComponent) => opt.value));
  }

  protected attachToOverlay() {
    if (!this.ref) {
      this.createOverlay();
      this.subscribeOnPositionChange();
      this.createKeyManager();
      this.subscribeOnOverlayKeys();
    }

    this.ref.attach(this.portal);
  }

  protected setActiveOption() {
    if (this.selectionModel.length) {
      const selectedOption = this.selectionModel[0];
      // Only set active if the selected option is in the focusable items (top-level)
      if (!this.isInsideNestedOption(selectedOption)) {
        this.keyManager.setActiveItem(selectedOption);
      }
    }
    // Don't set first item active by default - let keyboard navigation handle it naturally
    // This provides better UX as the highlight only appears when user starts navigating
  }

  protected createOverlay() {
    const scrollStrategy = this.createScrollStrategy();
    this.positionStrategy = this.createPositionStrategy();
    this.ref = this.overlay.create({
      positionStrategy: this.positionStrategy,
      scrollStrategy,
      panelClass: this.optionsPanelClass,
    });
  }

  protected createKeyManager(): void {
    const focusableItems = this.getFocusableItems();
    this.keyManager = this.focusKeyManagerFactoryService.create(focusableItems).withTypeAhead(200);
  }

  /**
   * Set the active item in the key manager.
   * Called by nested options when returning focus from a submenu to sync the key manager state.
   * @param item The focusable item to set as active
   */
  setKeyManagerActiveItem(item: NbFocusableOption): void {
    this.keyManager?.setActiveItem(item);
  }

  /**
   * Get the list of focusable items for keyboard navigation.
   * This includes top-level options (not inside nested options) and nested option triggers.
   * Items are returned in DOM order.
   */
  protected getFocusableItems(): NbFocusableOption[] {
    // Collect all options that belong to nested options
    const nestedOptionChildren = new Set<NbOptionComponent>();
    this.nestedOptions.forEach((nested) => {
      nested.options?.forEach((opt) => nestedOptionChildren.add(opt));
    });

    // Filter to only top-level options (not inside any nested option)
    const topLevelOptions = this.options.filter((option) => !nestedOptionChildren.has(option));
    const nestedOptionTriggers = this.nestedOptions.toArray();

    // Combine and sort by DOM order
    const allItems: NbFocusableOption[] = [...topLevelOptions, ...nestedOptionTriggers];

    // Sort by DOM position to maintain visual order
    allItems.sort((a, b) => {
      const aEl = (a as any).elementRef?.nativeElement;
      const bEl = (b as any).elementRef?.nativeElement;
      if (!aEl || !bEl) return 0;

      const position = aEl.compareDocumentPosition(bEl);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    return allItems;
  }

  /**
   * Check if an option is inside a nested option component.
   */
  protected isInsideNestedOption(option: NbOptionComponent): boolean {
    // Check if this option belongs to any nested option's children
    return this.nestedOptions?.some((nested) => nested.options?.some((opt) => opt === option)) ?? false;
  }

  /**
   * Build a flat index of all searchable options with their paths.
   * This traverses all options including nested options to create a searchable list.
   */
  protected buildSearchableOptionsIndex(): NbSearchableOption[] {
    const index: NbSearchableOption[] = [];

    // Process top-level options (not inside nested options)
    this.options.forEach((opt) => {
      if (!this.isInsideNestedOption(opt)) {
        index.push({
          option: opt,
          label: opt.content,
          path: [],
          pathDisplay: opt.content,
          searchText: opt.content.toLowerCase().trim(),
        });
      }
    });

    // Process nested options recursively
    this.nestedOptions.forEach((nested) => {
      this.indexNestedOptions(nested, [], index);
    });

    return index;
  }

  /**
   * Recursively index nested options and their children.
   * @param nested The nested option component to index
   * @param parentPath Path segments leading to this nested option
   * @param index The index array to add items to
   */
  protected indexNestedOptions(
    nested: NbOptionNestedComponent,
    parentPath: string[],
    index: NbSearchableOption[],
  ): void {
    const currentPath = [...parentPath, nested.title];

    // Get direct nested children (to exclude their options from this level)
    const directNestedChildren = nested.nestedChildren?.filter((n) => n !== nested) ?? [];
    const deeplyNestedOptions = new Set<NbOptionComponent>();
    directNestedChildren.forEach((child) => {
      child.options?.forEach((opt) => deeplyNestedOptions.add(opt));
    });

    // Add leaf options (not inside deeper nested children)
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

    // Recurse into nested children
    directNestedChildren.forEach((child) => {
      this.indexNestedOptions(child, currentPath, index);
    });
  }

  /**
   * Check if an option belongs to a deeply nested child.
   */
  protected isOptionInDeeperNested(option: NbOptionComponent, nested: NbOptionNestedComponent): boolean {
    const directNestedChildren = nested.nestedChildren?.filter((n) => n !== nested) ?? [];
    return directNestedChildren.some((child) => child.options?.some((opt) => opt === option));
  }

  /**
   * Filter the searchable index by the given search term.
   * @param term The search term to filter by
   * @returns Filtered list of searchable options
   */
  protected filterOptions(term: string): NbSearchableOption[] {
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) {
      return [];
    }

    return this.searchableIndex.filter((item) => item.searchText.includes(searchTerm));
  }

  /**
   * Handle search input changes.
   * @param event The input event
   */
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;

    // Close any open nested option submenus when searching in the parent
    this.closeAllNestedSubmenus();

    // Reset active index when search results change
    this.searchResultActiveIndex = -1;

    if (this.searchTerm) {
      // Rebuild index if needed and filter
      if (this.searchableIndex.length === 0) {
        this.searchableIndex = this.buildSearchableOptionsIndex();
      }
      this.searchResults = this.filterOptions(this.searchTerm);
    } else {
      this.searchResults = [];
    }

    this.cd.markForCheck();
  }

  /**
   * Select an option from search results.
   * @param result The search result to select
   */
  selectSearchResult(result: NbSearchableOption): void {
    this.handleOptionClick(result.option);
  }

  /**
   * Clear search state.
   */
  protected clearSearch(): void {
    this.searchTerm = '';
    this.searchResults = [];
    this.searchResultActiveIndex = -1;
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }
  }

  /**
   * Handle keyboard events in the search input.
   * @param event The keyboard event
   */
  onSearchKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    // Stop propagation for ALL keys to prevent key manager's typeahead from intercepting
    event.stopPropagation();

    if (keyCode === DOWN_ARROW) {
      event.preventDefault();
      if (this.searchResults.length > 0) {
        // Navigate search results
        if (this.searchResultActiveIndex < this.searchResults.length - 1) {
          this.searchResultActiveIndex++;
        }
        this.focusSearchResult(this.searchResultActiveIndex);
        this.cd.markForCheck();
      } else if (!this.searchTerm) {
        // No search term - navigate to first option using key manager
        this.keyManager?.setFirstItemActive();
      }
    } else if (keyCode === UP_ARROW) {
      event.preventDefault();
      if (this.searchResultActiveIndex > 0) {
        this.searchResultActiveIndex--;
        this.focusSearchResult(this.searchResultActiveIndex);
        this.cd.markForCheck();
      } else if (this.searchResultActiveIndex === 0) {
        // Return to search input
        this.searchResultActiveIndex = -1;
        this.searchInput?.nativeElement?.focus();
        this.cd.markForCheck();
      }
    } else if (keyCode === ENTER) {
      event.preventDefault();
      if (this.searchResultActiveIndex >= 0 && this.searchResultActiveIndex < this.searchResults.length) {
        this.selectSearchResult(this.searchResults[this.searchResultActiveIndex]);
      }
    } else if (keyCode === ESCAPE) {
      event.preventDefault();
      if (this.searchTerm) {
        // First escape clears search
        this.clearSearch();
        this.cd.markForCheck();
      } else {
        // Second escape closes dropdown
        this.hide();
        this.button.nativeElement.focus();
      }
    }
  }

  /**
   * Handle keyboard events on search result items.
   * @param event The keyboard event
   * @param index The index of the result item
   */
  onSearchResultKeydown(event: KeyboardEvent, index: number): void {
    const keyCode = event.keyCode;

    // Stop propagation for ALL keys to prevent key manager's typeahead from intercepting
    event.stopPropagation();

    if (keyCode === DOWN_ARROW) {
      event.preventDefault();
      if (index < this.searchResults.length - 1) {
        this.searchResultActiveIndex = index + 1;
        this.focusSearchResult(this.searchResultActiveIndex);
      }
    } else if (keyCode === UP_ARROW) {
      event.preventDefault();
      if (index > 0) {
        this.searchResultActiveIndex = index - 1;
        this.focusSearchResult(this.searchResultActiveIndex);
      } else {
        // Return to search input
        this.searchResultActiveIndex = -1;
        this.searchInput?.nativeElement?.focus();
      }
    } else if (keyCode === ENTER || keyCode === SPACE) {
      event.preventDefault();
      this.selectSearchResult(this.searchResults[index]);
    } else if (keyCode === ESCAPE) {
      event.preventDefault();
      this.clearSearch();
      this.searchInput?.nativeElement?.focus();
      this.cd.markForCheck();
    }
  }

  /**
   * Focus a search result by index.
   * @param index The index of the result to focus
   */
  protected focusSearchResult(index: number): void {
    if (this.ref?.overlayElement) {
      const results = this.ref.overlayElement.querySelectorAll('.search-result-item');
      if (results[index]) {
        (results[index] as HTMLElement).focus();
      }
    }
    this.cd.markForCheck();
  }

  /**
   * Handle mouse enter on search result.
   * @param index The index of the result
   */
  onSearchResultMouseEnter(index: number): void {
    this.searchResultActiveIndex = index;
    this.cd.markForCheck();
  }

  /**
   * Handle mouse enter on option list (to focus search input).
   */
  onOptionListMouseEnter(): void {
    if (this.searchable) {
      if (this.activeNestedOption && this.nestedSearchInput?.nativeElement) {
        this.nestedSearchInput.nativeElement.focus();
      } else if (this.searchInput?.nativeElement) {
        this.searchInput.nativeElement.focus();
      }
    }
  }

  /**
   * Build searchable index for the active nested option's children.
   * @param nestedOption The nested option to build index for
   */
  protected buildNestedSearchableIndex(nestedOption: NbOptionNestedComponent): NbSearchableOption[] {
    const index: NbSearchableOption[] = [];

    // Get direct nested children (to exclude their options)
    const directNestedChildren = nestedOption.nestedChildren?.filter((n) => n !== nestedOption) ?? [];
    const deeplyNestedOptions = new Set<NbOptionComponent>();
    directNestedChildren.forEach((child) => {
      child.options?.forEach((opt) => deeplyNestedOptions.add(opt));
    });

    // Add direct child options
    nestedOption.options?.forEach((opt) => {
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
      this.indexNestedOptions(child, [], index);
    });

    return index;
  }

  /**
   * Handle search input changes in replacement mode.
   * @param event The input event
   */
  onNestedSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.nestedSearchTerm = input.value;

    // Reset active index when search results change
    this.nestedSearchResultActiveIndex = -1;

    if (this.nestedSearchTerm && this.activeNestedOption) {
      // Build index if needed
      if (this.nestedSearchableIndex.length === 0) {
        this.nestedSearchableIndex = this.buildNestedSearchableIndex(this.activeNestedOption);
      }
      this.nestedSearchResults = this.filterNestedOptions(this.nestedSearchTerm);
    } else {
      this.nestedSearchResults = [];
    }

    this.cd.markForCheck();
  }

  /**
   * Filter nested searchable options by the given term.
   * @param term The search term
   */
  protected filterNestedOptions(term: string): NbSearchableOption[] {
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) {
      return [];
    }

    return this.nestedSearchableIndex.filter((item) => item.searchText.includes(searchTerm));
  }

  /**
   * Select an option from nested search results.
   * @param result The search result to select
   */
  selectNestedSearchResult(result: NbSearchableOption): void {
    this.handleOptionClick(result.option);
  }

  /**
   * Clear nested search state.
   */
  protected clearNestedSearch(): void {
    this.nestedSearchTerm = '';
    this.nestedSearchResults = [];
    this.nestedSearchResultActiveIndex = -1;
    this.nestedSearchableIndex = [];
    if (this.nestedSearchInput?.nativeElement) {
      this.nestedSearchInput.nativeElement.value = '';
    }
  }

  /**
   * Handle keyboard events in the nested search input.
   * @param event The keyboard event
   */
  onNestedSearchKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    // Stop propagation for ALL keys to prevent key manager's typeahead from intercepting
    event.stopPropagation();

    if (keyCode === DOWN_ARROW) {
      event.preventDefault();
      if (this.nestedSearchResults.length > 0) {
        if (this.nestedSearchResultActiveIndex < this.nestedSearchResults.length - 1) {
          this.nestedSearchResultActiveIndex++;
        }
        this.focusNestedSearchResult(this.nestedSearchResultActiveIndex);
        this.cd.markForCheck();
      }
    } else if (keyCode === UP_ARROW) {
      event.preventDefault();
      if (this.nestedSearchResultActiveIndex > 0) {
        this.nestedSearchResultActiveIndex--;
        this.focusNestedSearchResult(this.nestedSearchResultActiveIndex);
        this.cd.markForCheck();
      } else if (this.nestedSearchResultActiveIndex === 0) {
        this.nestedSearchResultActiveIndex = -1;
        this.nestedSearchInput?.nativeElement?.focus();
        this.cd.markForCheck();
      }
    } else if (keyCode === ENTER) {
      event.preventDefault();
      if (
        this.nestedSearchResultActiveIndex >= 0 &&
        this.nestedSearchResultActiveIndex < this.nestedSearchResults.length
      ) {
        this.selectNestedSearchResult(this.nestedSearchResults[this.nestedSearchResultActiveIndex]);
      }
    } else if (keyCode === ESCAPE) {
      event.preventDefault();
      if (this.nestedSearchTerm) {
        this.clearNestedSearch();
        this.cd.markForCheck();
      } else {
        this.exitReplacementMode();
      }
    } else if (keyCode === LEFT_ARROW) {
      // Arrow left goes back to previous level
      event.preventDefault();
      this.clearNestedSearch();
      this.exitReplacementMode();
    }
  }

  /**
   * Handle keyboard events on nested search result items.
   * @param event The keyboard event
   * @param index The index of the result item
   */
  onNestedSearchResultKeydown(event: KeyboardEvent, index: number): void {
    const keyCode = event.keyCode;

    // Stop propagation for ALL keys to prevent key manager's typeahead from intercepting
    event.stopPropagation();

    if (keyCode === DOWN_ARROW) {
      event.preventDefault();
      if (index < this.nestedSearchResults.length - 1) {
        this.nestedSearchResultActiveIndex = index + 1;
        this.focusNestedSearchResult(this.nestedSearchResultActiveIndex);
      }
    } else if (keyCode === UP_ARROW) {
      event.preventDefault();
      if (index > 0) {
        this.nestedSearchResultActiveIndex = index - 1;
        this.focusNestedSearchResult(this.nestedSearchResultActiveIndex);
      } else {
        this.nestedSearchResultActiveIndex = -1;
        this.nestedSearchInput?.nativeElement?.focus();
      }
    } else if (keyCode === ENTER || keyCode === SPACE) {
      event.preventDefault();
      this.selectNestedSearchResult(this.nestedSearchResults[index]);
    } else if (keyCode === ESCAPE) {
      event.preventDefault();
      this.clearNestedSearch();
      this.nestedSearchInput?.nativeElement?.focus();
      this.cd.markForCheck();
    } else if (keyCode === LEFT_ARROW) {
      event.preventDefault();
      this.clearNestedSearch();
      this.exitReplacementMode();
    }
  }

  /**
   * Focus a nested search result by index.
   * @param index The index of the result to focus
   */
  protected focusNestedSearchResult(index: number): void {
    if (this.ref?.overlayElement) {
      const results = this.ref.overlayElement.querySelectorAll('.nested-search-result-item');
      if (results[index]) {
        (results[index] as HTMLElement).focus();
      }
    }
    this.cd.markForCheck();
  }

  /**
   * Handle mouse enter on nested search result.
   * @param index The index of the result
   */
  onNestedSearchResultMouseEnter(index: number): void {
    this.nestedSearchResultActiveIndex = index;
    this.cd.markForCheck();
  }

  protected createPositionStrategy(): NbAdjustableConnectedPositionStrategy {
    // If we modified the position we disable the adjustment.
    const adjustment = this.optionsOverlayPosition === NbPosition.BOTTOM ? NbAdjustment.VERTICAL : NbAdjustment.NOOP;
    return this.positionBuilder
      .connectedTo(this.button)
      .position(this.optionsOverlayPosition)
      .offset(this.optionsOverlayOffsetTop)
      .adjustment(adjustment);
  }

  protected createScrollStrategy(): NbScrollStrategy {
    return this.overlay.scrollStrategies[this.scrollStrategy]();
  }

  protected createTriggerStrategy(): NbTriggerStrategy {
    return this.triggerStrategyBuilder
      .trigger(NbTrigger.CLICK)
      .host(this.hostRef.nativeElement)
      .container(() => this.getContainer())
      .build();
  }

  protected subscribeOnTriggers() {
    this.triggerStrategy.show$.subscribe(() => this.show());
    this.triggerStrategy.hide$.pipe(filter(() => this.isOpen)).subscribe(($event: Event) => {
      // Don't hide if click was inside a nested option's overlay panel
      // The nested overlay is separate from the main container, so the trigger strategy
      // sees it as an "outside" click, but we want to keep the select open for multi-select
      if (this.isClickedInsideNestedPanel($event)) {
        return;
      }
      this.hide();
      if (!this.isClickedWithinComponent($event)) {
        this.onTouched();
      }
    });
  }

  protected isClickedInsideNestedPanel($event: Event): boolean {
    const target = $event.target as Element;
    return !!target?.closest('.nb-option-nested-panel');
  }

  protected subscribeOnPositionChange() {
    this.positionStrategy.positionChange.pipe(takeUntil(this.destroy$)).subscribe((position: NbPosition) => {
      this.overlayPosition = position;
      this.cd.detectChanges();
    });
  }

  protected subscribeOnOptionClick() {
    /**
     * If the user changes provided options list in the runtime we have to handle this
     * and resubscribe on options selection changes event.
     * Otherwise, the user will not be able to select new options.
     * */
    this.options.changes
      .pipe(
        startWith(this.options),
        switchMap((options: QueryList<NbOptionComponent>) => {
          return merge(...options.map((option) => option.click));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((clickedOption: NbOptionComponent) => this.handleOptionClick(clickedOption));
  }

  protected subscribeOnOverlayKeys(): void {
    this.ref
      .keydownEvents()
      .pipe(
        filter(() => this.isOpen),
        takeUntil(this.destroy$),
      )
      .subscribe((event: KeyboardEvent) => {
        if (event.keyCode === ESCAPE) {
          // If in replacement mode, exit that first before closing the select
          if (this.activeNestedOption) {
            this.exitReplacementMode();
          } else {
            this.button.nativeElement.focus();
            this.hide();
          }
        } else if (event.keyCode === LEFT_ARROW && this.activeNestedOption) {
          // Arrow left exits replacement mode (go back)
          event.preventDefault();
          this.exitReplacementMode();
        } else if (event.keyCode === UP_ARROW && this.searchable && !this.activeNestedOption) {
          // If searchable and at first option (or no active), return to search input
          const activeIndex = this.keyManager?.activeItemIndex ?? -1;
          if (activeIndex <= 0) {
            event.preventDefault();
            this.keyManager?.setActiveItem(-1);
            this.searchInput?.nativeElement?.focus();
          } else {
            this.keyManager.onKeydown(event);
          }
        } else {
          this.keyManager.onKeydown(event);
        }
      });

    this.keyManager.tabOut.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.hide();
      this.onTouched();
    });
  }

  protected subscribeOnButtonFocus() {
    this.focusMonitor
      .monitor(this.button)
      .pipe(
        map((origin) => !!origin),
        finalize(() => this.focusMonitor.stopMonitoring(this.button)),
        takeUntil(this.destroy$),
      )
      .subscribe(this.focused$);
  }

  protected subscribeOnNestedOptionReplacementMode() {
    /**
     * Subscribe to nested options' replacement mode requests.
     * When a nested option doesn't have enough space for a submenu overlay,
     * it requests replacement mode where its children replace the main options.
     * */
    this.nestedOptions.changes
      .pipe(
        startWith(this.nestedOptions),
        switchMap((nestedOptions: QueryList<NbOptionNestedComponent>) => {
          return merge(...nestedOptions.map((nested) => nested.replacementModeRequested));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((nestedOption: NbOptionNestedComponent) => this.enterReplacementMode(nestedOption));
  }

  protected subscribeOnNestedOptionSubmenuShown() {
    /**
     * Subscribe to nested options' submenu shown events.
     * When a nested option shows its submenu, close all sibling nested options' submenus.
     * This handles the case where user moves from one branch to another without
     * triggering mouse leave on the parent.
     * */
    this.nestedOptions.changes
      .pipe(
        startWith(this.nestedOptions),
        switchMap((nestedOptions: QueryList<NbOptionNestedComponent>) => {
          return merge(...nestedOptions.map((nested) => nested.submenuShown));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((shownNestedOption: NbOptionNestedComponent) => {
        // Close all other top-level nested options' submenus
        this.nestedOptions?.forEach((nested) => {
          if (nested !== shownNestedOption && nested.submenuOpen) {
            nested.hideSubmenu();
          }
        });
      });
  }

  protected getContainer() {
    return (
      this.ref &&
      this.ref.hasAttached() &&
      <ComponentRef<any>>{
        location: {
          nativeElement: this.ref.overlayElement,
        },
      }
    );
  }

  /**
   * Propagate selected value.
   * */
  protected emitSelected(selected) {
    this.onChange(selected);
    this.selectedChange.emit(selected);
  }

  /**
   * Set selected value in model.
   * */
  protected setSelection(value) {
    const isResetValue = value == null;
    let safeValue = value;

    if (this.multiple) {
      safeValue = value ?? [];
    }

    const isArray: boolean = Array.isArray(safeValue);

    if (this.multiple && !isArray && !isResetValue) {
      throw new Error("Can't assign single value if select is marked as multiple");
    }
    if (!this.multiple && isArray) {
      throw new Error("Can't assign array if select is not marked as multiple");
    }

    const previouslySelectedOptions = this.selectionModel;
    this.selectionModel = [];

    if (this.multiple) {
      safeValue.forEach((option) => this.selectValue(option));
    } else {
      this.selectValue(safeValue);
    }

    // find options which were selected before and trigger deselect
    previouslySelectedOptions
      .filter((option: NbOptionComponent) => !this.selectionModel.includes(option))
      .forEach((option: NbOptionComponent) => option.deselect());

    this.cd.markForCheck();
  }

  /**
   * Selects value.
   * */
  protected selectValue(value) {
    if (value == null) {
      return;
    }

    const corresponding = this.options.find((option: NbOptionComponent) => this._compareWith(option.value, value));

    if (corresponding) {
      corresponding.select();
      this.selectionModel.push(corresponding);
    }
  }

  protected shouldShow(): boolean {
    return this.isHidden && this.options?.length > 0;
  }

  /**
   * Sets touched if focus moved outside of button and overlay,
   * ignoring the case when focus moved to options overlay.
   */
  trySetTouched() {
    if (this.isHidden) {
      this.onTouched();
    }
  }

  protected isClickedWithinComponent($event: Event) {
    return this.hostRef.nativeElement === $event.target || this.hostRef.nativeElement.contains($event.target as Node);
  }

  protected canSelectValue(): boolean {
    return !!(this.options && this.options.length);
  }

  @HostBinding('class.size-tiny')
  get tiny(): boolean {
    return this.size === 'tiny';
  }
  @HostBinding('class.size-small')
  get small(): boolean {
    return this.size === 'small';
  }
  @HostBinding('class.size-medium')
  get medium(): boolean {
    return this.size === 'medium';
  }
  @HostBinding('class.size-large')
  get large(): boolean {
    return this.size === 'large';
  }
  @HostBinding('class.size-giant')
  get giant(): boolean {
    return this.size === 'giant';
  }
  @HostBinding('class.status-primary')
  get primary(): boolean {
    return this.status === 'primary';
  }
  @HostBinding('class.status-info')
  get info(): boolean {
    return this.status === 'info';
  }
  @HostBinding('class.status-success')
  get success(): boolean {
    return this.status === 'success';
  }
  @HostBinding('class.status-warning')
  get warning(): boolean {
    return this.status === 'warning';
  }
  @HostBinding('class.status-danger')
  get danger(): boolean {
    return this.status === 'danger';
  }
  @HostBinding('class.status-basic')
  get basic(): boolean {
    return this.status === 'basic';
  }
  @HostBinding('class.status-control')
  get control(): boolean {
    return this.status === 'control';
  }
  @HostBinding('class.shape-rectangle')
  get rectangle(): boolean {
    return this.shape === 'rectangle';
  }
  @HostBinding('class.shape-round')
  get round(): boolean {
    return this.shape === 'round';
  }
  @HostBinding('class.shape-semi-round')
  get semiRound(): boolean {
    return this.shape === 'semi-round';
  }
}
