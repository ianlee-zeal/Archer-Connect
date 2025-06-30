import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SavedSearchesListComponent } from './saved-searches-list/saved-searches-list.component';
import { SharedModule } from '../shared/shared.module';
import { SavedSearchesRoutingModule } from './saved-searches-routing.module';
import { SavedSearchesRendererComponent } from './renderers/saved-searches-buttons-renderer';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [
    SavedSearchesListComponent,
    SavedSearchesRendererComponent,
  ],
  exports: [
    SavedSearchesListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    AgGridModule,
    SavedSearchesRoutingModule,
    SharedModule,
  ],
})

export class SavedSearchesModule { }
