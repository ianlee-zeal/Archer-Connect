import { Component, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { takeUntil } from 'rxjs/operators';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import { ofType } from '@ngrx/effects';
import { EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { LogService } from '@app/services/log-service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { TypedAction } from '@ngrx/store/src/models';
import { ProjectsCommonState } from '../../projects/state/reducer';
import * as globalPaymentQueueActions from '../state/actions';
import * as projectActions from '@app/modules/projects/state/actions'
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import * as docActions from '@app/modules/shared/state/upload-bulk-document/actions';
import { AuthorizeEntriesModalComponent } from '../authorize-entries-modal/authorize-entries-modal.component';

enum Step {
  SelectedEntries = 1,
  DeficiencySummary = 2,
  Results = 3,
}

@Component({
  selector: 'app-authorize-lien-entries-modal',
  templateUrl: './authorize-lien-entries-modal.component.html',
})
export class AuthorizeLienEntriesModalComponent extends AuthorizeEntriesModalComponent implements OnDestroy {
  public validationCompleted : Boolean = false;
  public readonly validateButtonAwaitedActions = [
    globalPaymentQueueActions.ValidateAuthorizeLienEntriesCompleted.type,
    globalPaymentQueueActions.ValidateAuthorizeLienEntriesError.type,
    docActions.DownloadDocumentComplete.type,
    docActions.DownloadDocumentError.type,
  ];

  public readonly authorizeButtonAwaitedActions = [
    globalPaymentQueueActions.ApproveAuthorizeLienEntriesCompleted.type,
    globalPaymentQueueActions.ApproveAuthorizeLienEntriesError.type,
  ];

  constructor(
    public modal: BsModalRef,
    public store: Store<ProjectsCommonState>,
    protected actionsSubj: ActionsSubject,
    public pusher: PusherService,
    protected enumToArray: EnumToArrayPipe,
    protected logger: LogService,
  ) {
    super(modal, store, actionsSubj, pusher, enumToArray, logger);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.subscribeToActions();
  }

  public onValidateClick(): void {
    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.AuthorizeLienEntries);
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.validationChannelEventHandler.bind(this),
      this.enqueueValidation.bind(this, channelName),
    );
  }

  public onAuthorizeClick(): void {
    this.unsubscribePusherChannel();
    this.pusherChannel = this.pusher.subscribeChannel(
      this.batchAction.channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.resultsChannelEventHandler.bind(this),
      this.authorizeApprove.bind(this),
    );
  }

  private validationChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.validationCompleted = true;
        this.validationResultDocId = data.PreviewDocId;
        this.store.dispatch(globalPaymentQueueActions.ValidateAuthorizeLienEntriesCompleted());
        this.store.dispatch(projectActions.GetBatchActionDeficienciesRequest({
            batchActionId: this.batchAction.id,
            documentTypeId: BatchActionDocumentType.PreviewValidation,
        }));
        this.step = Step.DeficiencySummary;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.store.dispatch(globalPaymentQueueActions.ValidateAuthorizeLienEntriesError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  private resultsChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.generateResultTabsGroup(data);
        this.dataUpdated.emit();
        this.store.dispatch(globalPaymentQueueActions.ApproveAuthorizeLienEntriesCompleted());
        this.step = Step.Results;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[resultsChannelEventHandler]', data);
        this.store.dispatch(globalPaymentQueueActions.ApproveAuthorizeLienEntriesError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  private enqueueValidation(channelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.paymentQueueGridLocalData, this.paymentQueueGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;

    const batchAction: BatchActionDto = {
      entityTypeId: this.projectId ? EntityTypeEnum.Projects : 0,
      entityId: this.projectId || 0,
      batchActionFilters: [{ filter: JSON.stringify({ searchOptions: searchOptions }) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.PaymentQueueAuthorizeLienEntries,
    };
    this.store.dispatch(globalPaymentQueueActions.ValidateAuthorizeLienEntries({ batchAction }));
  }

  private authorizeApprove(): void {
    this.store.dispatch(globalPaymentQueueActions.ApproveAuthorizeLienEntries({ batchActionId: this.batchAction.id }));
  }

  private subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.ValidateAuthorizeLienEntriesError),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.pending = false;
      this.errorMessage = action.errorMessage;
    });

    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.ValidateAuthorizeLienEntriesSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { batchAction: BatchAction; } & TypedAction<string>) => {
      this.batchAction = action.batchAction;
    });

    this.actionsSubj.pipe(
        ofType(projectActions.GetBatchActionDeficienciesSuccess),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(() => {
        this.pending = false;
      });
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
