import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { SideNavMenuService } from '@app/services/navigation/side-nav-menu.service';
import { CreateOrUpdateTemplateRequest } from '@app/models/documents/document-generators';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import * as fromShared from '@shared/state';
import { DownloadDocument } from '../../shared/state/upload-bulk-document/actions';
import * as selectors from '../state/selectors';
import { DocumentTemplatesState } from '../state/reducer';
import * as actions from '../state/actions';
import { TestCSGenerationRequest } from '@app/models/docusign-sender/test-cs-generation-request';

@Component({
  selector: 'app-document-templates-page',
  templateUrl: './document-templates-page.component.html',
  styleUrls: ['./document-templates-page.component.scss'],
})
export class DocumentTemplatesPageComponent {
  private gridParams: IServerSideGetRowsParamsExtended;
  private readonly ngUnsubscribe$ = new Subject<void>();

  readonly error$ = this.sharedStore.select(fromShared.sharedSelectors.commonSelectors.error);
  readonly actionBar$ = this.store.select(selectors.actionBar);

  readonly gridId: GridId = GridId.DocumentTemplates;

  constructor(
    private readonly sharedStore: Store<fromShared.AppState>,
    private readonly store: Store<DocumentTemplatesState>,
    private readonly sideNavMenuService: SideNavMenuService,
  ) {}

  onActionBarUpdated(actionBar: ActionHandlersMap) {
    this.store.dispatch(actions.UpdateDocumentTemplatesActionBar({ actionBar }));
  }

  onFetch(gridParams: IServerSideGetRowsParamsExtended) {
    this.gridParams = gridParams;
    this.store.dispatch(actions.GetDocumentTemplates({ gridParams }));
  }

  onTemplateDelete(templateId: number) {
    this.store.dispatch(actions.DeleteDocumentTemplate({ templateId, gridParams: this.gridParams }));
  }

  onTemplateCreateOrUpdate(request: CreateOrUpdateTemplateRequest) {
    if (request.documentId) {
      this.store.dispatch(actions.UpdateDocumentTemplate({ request, gridParams: this.gridParams }));
    } else {
      this.store.dispatch(actions.CreateDocumentTemplate({ request, gridParams: this.gridParams }));
    }
  }

  onTestDITFile(templateId: number, request: TestCSGenerationRequest) {
    if (templateId != null ) {
      this.store.dispatch(actions.TestDITFile({templateId, request, gridParams: this.gridParams}));
    } else {
      this.store.dispatch(actions.TestDITFileFromCreate({request, gridParams: this.gridParams}));
    }
  }

  onDownloadDocumentTemplate(id: number) {
    this.store.dispatch(DownloadDocument({ id }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
