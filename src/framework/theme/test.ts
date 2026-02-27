/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  teardown: { destroyAfterEach: true },
});

// Angular 21 runs exhaustive checkNoChanges on every fixture.detectChanges(),
// which throws ExpressionChangedAfterItHasBeenCheckedError when tests mutate
// component state between detection cycles (standard test pattern).
// Use changeDetectorRef.detectChanges() which skips the verification pass.
ComponentFixture.prototype.detectChanges = function () {
  this.changeDetectorRef.detectChanges();
};
