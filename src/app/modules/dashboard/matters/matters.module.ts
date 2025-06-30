import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatterReducer } from './state/reducer';
import { MattersEffects } from './state/effects';
import { MattersListComponent } from './matters-list/matters-list.component';
import { MattersRoutingModule } from './matters-routing.module';
import { MattersComponent } from './matters/matters.component';
import { MatterDetailsComponent } from './matter-details/matter-details.component';
import { RelatedSettlementListComponent } from './matter-details/related-settlements/related-settlements-list.component';
import { MatterTabsComponent } from './matter-details/matter-tabs/matter-tabs.component';
import { MatterInformationComponent } from './matter-details/matterInformation/matter-information.component';
import { MatterAddComponent } from './matter-add/matter-add.component';
import { MatterNotesComponent } from './matter-details/matter-notes/matter-notes.component';
import { MatterDocumentsComponent } from './matter-details/matter-documents/matter-documents.component';

@NgModule({
    declarations: [
        MattersComponent,
        MattersListComponent,
        MatterDetailsComponent,
        RelatedSettlementListComponent,
        MatterTabsComponent,
        MatterNotesComponent,
        MatterDocumentsComponent,
        MatterInformationComponent,
        MatterAddComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        MattersRoutingModule,
        ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        ModalModule.forRoot(),
        AgGridModule,
        StoreModule.forFeature('matter_feature', MatterReducer),
        EffectsModule.forFeature([
            MattersEffects,
        ]),
    ]
})
export class MattersModule {
}
