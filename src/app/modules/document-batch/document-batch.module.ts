import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { DocumentBatchViewComponent } from './document-batch-view/document-batch-view.component';
import { DocumentBatchRoutingModule } from './document-batch-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DocumentBatchListViewComponent } from './document-batch-list-view/document-batch-list-view.component';
import { DocumentBatchFilesComponent } from './document-batch-files/document-batch-files.component';
import { DocumentbatchModalComponent } from './document-batch-modal/document-batch-modal.component';
import { DocumentBatchDetailsComponent } from './document-batch-details/document-batch-details.component';
import { DocumentBatchDetailsSectionComponent } from './document-batch-details-section/document-batch-details-section.component';
import { DocumentBatchDetailsHeaderComponent } from './document-batch-details-header/document-batch-details-header.component';
import { DocumentBatchDetailsFilesComponent } from './document-batch-details/document-batch-details-files/document-batch-details-files.component.';

@NgModule({
  declarations: [
    DocumentBatchViewComponent,
    DocumentBatchListViewComponent,
    DocumentBatchFilesComponent,
    DocumentbatchModalComponent,
    DocumentBatchDetailsComponent,
    DocumentBatchDetailsSectionComponent,
    DocumentBatchDetailsHeaderComponent,
    DocumentBatchDetailsFilesComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DocumentBatchRoutingModule,
    AgGridModule,
  ],
})
export class DocumentBatchModule { }
