import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@shared/shared.module';
import { GlobalCommunicationSearchReducer } from './state/reducer';
import { GlobalCommunicationSearchEffects } from './state/effects';
import { GlobalCommunicationSearchRoutingModule } from './global-communication-search-routing.module';
import { GlobalCommunicationSearch } from './global-communication-search.component/global-communication-search.component';
import { GlobalCommunicationSearchButtonsRenderer } from './renderers/global-communication-search-buttons-renderer';
import { GlobalCommunicationSearchComponent } from './global-communication-search-list/global-communication-search-list.component';

@NgModule({
  declarations: [
    GlobalCommunicationSearch,
    GlobalCommunicationSearchComponent,
    GlobalCommunicationSearchButtonsRenderer,
  ],
  imports: [
    CommonModule,
    SharedModule,
    GlobalCommunicationSearchRoutingModule,
    AgGridModule,
    StoreModule.forFeature('global-communication-search_feature', GlobalCommunicationSearchReducer),
    EffectsModule.forFeature([
      GlobalCommunicationSearchEffects,
    ]),
  ],
})
export class GlobalCommunicationSearchModule {
}
