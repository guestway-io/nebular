/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'nb-select-nested-form',
  templateUrl: './select-nested-form.component.html',
  standalone: false,
})
export class SelectNestedFormComponent implements OnInit {
  form: FormGroup;

  ngOnInit() {
    this.form = new FormGroup({
      category: new FormControl(null, Validators.required),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      alert(`Form submitted with category: ${this.form.value.category}`);
    }
  }
}
