/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'nb-select-nested-disabled',
  templateUrl: './select-nested-disabled.component.html',
  standalone: false,
})
export class SelectNestedDisabledComponent {
  selectedValue: string;
  nestedDisabled = true;
  selectDisabled = false;
}
