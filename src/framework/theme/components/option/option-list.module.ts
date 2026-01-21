import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbOptionComponent } from './option.component';
import { NbOptionGroupComponent } from './option-group.component';
import { NbOptionListComponent } from './option-list.component';
import { NbOptionNestedComponent } from './option-nested.component';
import { NbCheckboxModule } from '../checkbox/checkbox.module';
import { NbIconModule } from '../icon/icon.module';
import { NbOverlayModule } from '../cdk/overlay/overlay.module';
import { NbInputModule } from '../input/input.module';

const NB_OPTION_LIST_COMPONENTS = [
  NbOptionListComponent,
  NbOptionComponent,
  NbOptionGroupComponent,
  NbOptionNestedComponent,
];

@NgModule({
  declarations: [...NB_OPTION_LIST_COMPONENTS],
  imports: [CommonModule, NbCheckboxModule, NbIconModule, NbOverlayModule, NbInputModule],
  exports: [...NB_OPTION_LIST_COMPONENTS],
})
export class NbOptionModule {}
