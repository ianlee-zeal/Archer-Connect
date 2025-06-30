import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import { EntityTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GridId } from '@app/models/enums/grid-id.enum';
import { UpdatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager/related-page.enum';
import { Router } from '@angular/router';
import * as fromSharedSelectors from '@shared/state/index';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ClaimantsState } from '../../../claimants/state/reducer';
import { communicationSelectors } from '../state/selectors';
import { UpdateCommunicationDetailsActionBar, UpdateProjectCommunicationDocumentsCount } from '../state/actions';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-communication-related-documents',
  templateUrl: './communication-related-documents.component.html',
})
export class CommunicationRelatedDocumentsComponent implements OnInit, OnDestroy {
  public readonly entityType = EntityTypeEnum.Communications;
  public readonly gridId: GridId = GridId.CommunicationDocuments;
  public isProjectsPage: boolean;
  public relatedDocuments: Document[] = [];

  public communication$ = this.store.select(communicationSelectors.currentCommunicationRecord);
  public documents$ = this.store.select(fromSharedSelectors.sharedSelectors.documentsListSelectors.documents);

  protected readonly canReadDocuments = this.permissionService.canRead(PermissionTypeEnum.ClientCommunicationsDocuments);

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<ClaimantsState>,
    private router: Router,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.isProjectsPage = this.router.url.split('/')[1] === GridId.Projects;

    if (!this.isProjectsPage) {
      this.store.dispatch(UpdatePager({ pager: { relatedPage: RelatedPage.GlobalCommunicationSearch, isForceDefaultBackNav: false } }));
    }

    this.documents$
      .pipe(
        filter(documents => documents?.length > 0),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(documents => {
        this.relatedDocuments = documents;
        this.store.dispatch(UpdateProjectCommunicationDocumentsCount({ count: documents.length }));
      });
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap) {
    this.store.dispatch(UpdateCommunicationDetailsActionBar({
      actionBar: {
        ...actionBar,
        clearFilter: {
          callback: () => undefined,
          hidden: () => true,
        },
      },
    }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
