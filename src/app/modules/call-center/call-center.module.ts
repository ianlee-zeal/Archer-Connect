import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AgGridModule } from 'ag-grid-angular';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { QuillModule } from 'ngx-quill';

import { SharedModule } from '../shared/shared.module';
import { CallWidgetComponent } from './call-widget/call-widget.component';
import { reducer } from './state/reducer';
import { CallWidgetEffects } from './call-widget/state/effects';
import { CommunicationListEffects } from './communication-list/state/effects';
import { CommunicationListComponent } from './communication-list/communication-list.component';
import { CommunicationActionPanelRendererComponent } from './communication-list/renderers/action-panel-renderer/communication-action-panel-renderer';
import { CommunicationCustomTooltip } from './communication-list/renderers/communication-custom-tooltip/communication-custom-tooltip';
import { CallCenterRoutingModule } from './call-center-routing.module';
import { FEATURE_NAME } from './state';

import { CommunicationEffects } from './communication/state/effects';
import { CommunicationCreatePageComponent } from './communication/communication-create-page/communication-create-page.component';
import { CommunicationDetailsComponent } from './communication/communication-details/communication-details.component';
import { CommunicationEditPageComponent } from './communication/communication-edit-page/communication-edit-page.component';
import { CommunicationRelatedDocumentsComponent } from './communication/communication-related-documents/communication-related-documents.component';
import { NewPhoneCallComponent } from './call-widget/new-phone-call/new-phone-call.component';
import { CommunicationViewEditPageComponent } from './communication/communication-view-edit-page/communication-view-edit-page.component';
import { CommunicationViewCreatePageComponent } from './communication/communication-view-create-page/communication-view-create-page.component';
import { CommunicationNotesPageComponent } from './communication/communication-notes-page/communication-notes-page.component';
import { ProjectsCommunicationCreatePageComponent } from './projects-communication/projects-communication-create-page/projects-communication-create-page.component';
import { ProjectsCommunicationDetailsComponent } from './projects-communication/projects-communication-details/projects-communication-details.component';
import { ProjectsCommunicationEditPageComponent } from './projects-communication/projects-communication-edit-page/projects-communication-edit-page.component';

@NgModule({
  declarations: [
    CallWidgetComponent,
    CommunicationListComponent,
    CommunicationActionPanelRendererComponent,
    CommunicationCustomTooltip,
    CommunicationCreatePageComponent,
    ProjectsCommunicationCreatePageComponent,
    CommunicationDetailsComponent,
    ProjectsCommunicationDetailsComponent,
    CommunicationEditPageComponent,
    ProjectsCommunicationEditPageComponent,
    CommunicationRelatedDocumentsComponent,
    NewPhoneCallComponent,
    CommunicationViewEditPageComponent,
    CommunicationViewCreatePageComponent,
    CommunicationNotesPageComponent,
  ],
  exports: [
    CallWidgetComponent,
    CommunicationListComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    CallCenterRoutingModule,
    AgGridModule,
    StoreModule.forFeature(FEATURE_NAME, reducer),
    EffectsModule.forFeature([
      CallWidgetEffects,
      CommunicationListEffects,
      CommunicationEffects,
    ]),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    QuillModule,
  ],
})
export class CallCenterModule { }
