import { Injectable } from '@angular/core';

import { EntityTypeEnum } from '@app/models/enums';
import { Page } from '@app/models/page';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Observable } from 'rxjs';
import { DocumentsService } from '@app/services/api';
import { Document } from '@app/models/documents/document';
import { SharedDocumentsListState } from '@app/modules/shared/state/documents-list/reducer';


@Injectable({ providedIn: 'root' })
export class DocumentListService {
  constructor(
    private documentsService: DocumentsService,
  ) { }

  public callDocumentListApi(agGridParams: IServerSideGetRowsParamsExtended, entireState: SharedDocumentsListState, isMaster: boolean): Observable<Page<Document>> {
    switch (entireState.searchParams.entityTypeIdToFilterDocTypes) {
      case EntityTypeEnum.PaymentItemStatus:
        return this.documentsService.getDocumentsListByDocumentType(entireState.searchParams?.documentTypeId, agGridParams?.request ?? {}, entireState.searchParams);
      default:
        return this.documentsService.getDocumentsList(agGridParams?.request ?? {}, entireState.searchParams, isMaster);
    }
  }
}
