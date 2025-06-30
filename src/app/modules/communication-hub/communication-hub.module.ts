import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CommunicationHubRoutingModule } from './communication-hub-routing.module';
import { ANDIMessagingSectionComponent } from './andi-messaging-section/andi-messaging-section.component';
import { InboxComponent } from './inbox/inbox.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { ComposeMessageModalComponent } from '@app/modules/communication-hub/compose-message-modal/compose-message-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { QuillEditorComponent } from 'ngx-quill';
import { InputBoxComponent } from '@app/modules/communication-hub/input-box/input-box.component';
import { MessageViewComponent } from './message-view/message-view.component';

@NgModule({
  declarations: [
    ANDIMessagingSectionComponent,
    InboxComponent,
    SearchBoxComponent,
    InputBoxComponent,
    ComposeMessageModalComponent,
    MessageViewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CommunicationHubRoutingModule,
    FormsModule,
    ModalModule,
    QuillEditorComponent,
    ReactiveFormsModule,
  ]
})
export class CommunicationHubModule { }
