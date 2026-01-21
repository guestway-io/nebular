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
  selectedValue: string | undefined;
}
