import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Document } from '@app/models/documents';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import { UntypedFormGroup } from '@angular/forms';
import { UrlHelper } from '@app/helpers/url-helper';
import { PermissionTypeEnum } from '@app/models/enums';
import { EntityTypeEnum } from '@app/models/enums/entity-type.enum';
import { GridId } from '@app/models/enums/grid-id.enum';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { RelatedPage } from '@app/modules/shared/grid-pager/related-page.enum';
import { PermissionService, ToastService } from '@app/services';
import * as fromShared from '@shared/state/common.actions';
import * as fromSharedSelectors from '@shared/state/index';
import { filter, takeUntil } from 'rxjs/operators';
import * as claimantDetailsActions from '../../../claimants/claimant-details/state/actions';
import { ClaimantsState } from '../../../claimants/state/reducer';
import { CommunicationDetailsComponent } from '../communication-details/communication-details.component';
import * as actions from '../state/actions';
import { communicationSelectors } from '../state/selectors';

@Component({
  selector: 'app-communication-create-page',
  templateUrl: './communication-create-page.component.html',
  styleUrls: ['./communication-create-page.component.scss'],
})
export class CommunicationCreatePageComponent extends Editable implements OnInit, OnDestroy {
  @ViewChild(CommunicationDetailsComponent) communicationDetailsComponent : CommunicationDetailsComponent;

  public currentCommunicationRecord$ = this.store.select(communicationSelectors.currentCommunicationRecord);
  public documents$ = this.store.select(fromSharedSelectors.sharedSelectors.documentsListSelectors.documents);

  private ngUnsubscribe$ = new Subject<void>();

  private parentId: number;
  private relatedDocuments: Document[] = [];

  public canEdit: boolean = true;

  public actionBar: ActionHandlersMap = {
    save: {
      callback: () => this.save(),
      disabled: () => false,
      awaitedActionTypes: [
        actions.SaveCommunicationRecordSuccess.type,
        fromShared.FormInvalid.type,
        actions.Error.type,
      ],
    },
    cancel: () => this.store.dispatch(fromShared.GotoParentView()),
  };

  private get canReadNotes(): boolean {
    return this.permissionService.canRead(PermissionTypeEnum.CommunicationNotes);
  }

  constructor(
    private store: Store<ClaimantsState>,
    private router: Router,
    private toaster: ToastService,
    private readonly permissionService: PermissionService,
  ) {
    super();
  }

  get hasChanges(): boolean {
    if (!this.communicationDetailsComponent) {
      return false;
    }

    return this.communicationDetailsComponent.validationForm.dirty;
  }

  protected get validationForm(): UntypedFormGroup {
    return null;
  }

  ngOnInit(): void {
    this.parentId = +UrlHelper.getParent(this.router.url, '/overview');

    this.documents$
      .pipe(
        filter((documents: Document[]) => !!documents),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((documents: Document[]) => {
        this.relatedDocuments = documents;
      });

    this.store.dispatch(claimantDetailsActions.UpdateClaimantsActionBar({ actionBar: this.actionBar }));
    this.store.dispatch(fromShared.UpdatePager({ pager: { relatedPage: RelatedPage.ClaimantsCommunications, isForceDefaultBackNav: false } }));

    this.store.dispatch(actions.CreateNewCommunicationRecord());
  }

  protected save(): void {
    if (this.communicationDetailsComponent.validate()) {
      const communication = CommunicationRecord.fromFormValue(EntityTypeEnum.Clients, this.parentId, this.communicationDetailsComponent.formGroup.value);

      communication.relatedDocuments = this.relatedDocuments.map((r: Document) => ({ ...r, ...{ id: 0 } }));
      communication.relatedDocumentsCount = this.relatedDocuments?.length;

      this.store.dispatch(actions.SaveCommunicationRecordRequest({
        entityId: this.parentId,
        communicationRecord: communication,
        canReadNotes: this.canReadNotes,
        entity: GridId.Claimants,
        callback: () => this.saveCompleted(),
      }));
    } else {
      this.store.dispatch(fromShared.FormInvalid());
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  private saveCompleted(): void {
    this.communicationDetailsComponent.validationForm.markAsPristine();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
