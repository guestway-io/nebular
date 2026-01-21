/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'nb-select-searchable',
  templateUrl: './select-searchable.component.html',
  standalone: false,
})
export class SelectSearchableComponent {
  // Size examples
  selectedTiny: string | undefined;
  selectedSmall: string | undefined;
  selectedMedium: string | undefined;
  selectedLarge: string | undefined;
  selectedGiant: string | undefined;

  // Deep nesting example
  selectedValue: string | undefined;

  // Multi-select example
  selectedMultiple: string[] = [];
}
