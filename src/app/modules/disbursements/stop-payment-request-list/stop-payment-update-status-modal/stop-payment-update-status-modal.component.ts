import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';

import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IGridLocalData } from '@app/state/root.state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Subject } from 'rxjs';
import { PusherService } from '@app/services/pusher.service';
import { LogService } from '@app/services/log-service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { Channel } from 'pusher-js';
import { BatchActionDto } from '@app/models/batch-action/batch-action';
import { AppState } from '@app/state';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { StopPaymentRequestStatusEnum, StopPaymentStatusForBatchUpdateEnum } from '@app/models/enums/payment-status.enum';
import * as rootSelectors from '@app/state/index';
import { GridId } from '@app/models/enums/grid-id.enum';
import { first } from 'rxjs/operators';
import { EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { IStopPaymentUpdateStatusRequestDto } from '@app/models/payment-request/stop-payment-update-status-request';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import * as paymentActions from '@app/modules/payments/state/actions';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { ToastService, ValidationService } from '@app/services';
import { sharedSelectors, sharedActions } from '@app/modules/shared/state/index';
import { Attachment } from '@app/models/attachment';
import { AttachmentForm } from '@app/modules/shared/_abstractions/attachment-form';
import * as selectors from '../../state/selectors';

@Component({
  selector: 'app-stop-payment-update-status-modal',
  templateUrl: './stop-payment-update-status-modal.component.html',
  styleUrls: ['./stop-payment-update-status-modal.component.scss'],
})
export class StopPaymentUpdateStatusModalComponent extends AttachmentForm implements OnDestroy {
  public statusesUpdated = new EventEmitter();
  public errorText: string;
  public statuses: SelectOption[] = this.getStatusesForDropdown();
  public showBusinessDays = false;
  public showRejectReason = false;
  public showCheckNumber = false;
  public showComment = false;
  public isCommentRequired = false;
  private readonly ngUnsubscribe$ = new Subject<void>();
  private stopPaymentGridParams: IServerSideGetRowsParamsExtended;
  private stopPaymentGridLocalData: IGridLocalData;
  private pusherChannel: Channel;
  public selectedFile: File;
  public attachments: Attachment[] = [];
  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);
  private isCompletedUpdatingStatus: boolean;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public readonly submitButtonAwaitedActions = [
    paymentActions.Error.type,
    paymentActions.BatchUpdateStopPaymentStatusError,
  ];

  public form: UntypedFormGroup = new UntypedFormGroup(
    {
      status: new UntypedFormControl(null, [Validators.required]),
      businessDays: new UntypedFormControl(null),
      rejectReason: new UntypedFormControl(null, [Validators.maxLength(150)]),
      checkNumber: new UntypedFormControl(null),
      comment: new UntypedFormControl(null, [Validators.maxLength(150)]),
    },
  );

  get valid(): boolean {
    const isRowsSelected = this.stopPaymentGridLocalData
    && this.stopPaymentGridLocalData.selectedRecordsIds
    && [...this.stopPaymentGridLocalData.selectedRecordsIds.entries()].filter(entry => entry[1]).some(entry => entry);
    if (!isRowsSelected && !this.isCompletedUpdatingStatus) {
      this.errorText = 'No rows selected in the grid';
    }
    return isRowsSelected;
  }

  get isValidAttachment() {
    const status = this.form.controls.status.value?.id;
    switch (status) {
      case StopPaymentRequestStatusEnum.PendingAPUpdates:
      case StopPaymentRequestStatusEnum.APUpdatesComplete:
      case StopPaymentRequestStatusEnum.ReadyToPay:
      case StopPaymentRequestStatusEnum.PendingQC:
      case StopPaymentRequestStatusEnum.Rejected:
        return this.attachments.length > 0;

      default:
        return true;
    }
  }

  constructor(
    public modal: BsModalRef,
    public store: Store<AppState>,
    public pusher: PusherService,
    private enumToArray: EnumToArrayPipe,
    private logger: LogService,
    private readonly toastService: ToastService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.subscribeToStopPaymentGridLocalData();
    this.subscribeToStopPaymentGridParams();
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());
  }

  onCancel() {
    this.modal.hide();
  }

  private getStatusesForDropdown() {
    const statuses = this.enumToArray.transformForStringKeys(StopPaymentStatusForBatchUpdateEnum);
    // remove Review status
    statuses.splice(statuses.findIndex(v => v.id === StopPaymentRequestStatusEnum.Review), 1);
    return statuses;
  }

  onStatusSelected(option: SelectOption) {
    if (option) {
      this.showBusinessDays = option.id === StopPaymentRequestStatusEnum.WaitingPeriod;
      this.showRejectReason = option.id === StopPaymentRequestStatusEnum.Rejected
        || option.id === StopPaymentRequestStatusEnum.RejectedWrongCheck;
      this.showComment = option.id !== StopPaymentRequestStatusEnum.WaitingPeriod
        && option.id !== StopPaymentRequestStatusEnum.ReadyToPay
        && option.id !== StopPaymentRequestStatusEnum.Rejected
        && option.id !== StopPaymentRequestStatusEnum.RejectedWrongCheck;
      this.showCheckNumber = option.id === StopPaymentRequestStatusEnum.Completed;
      this.isCommentRequired = option.id === StopPaymentRequestStatusEnum.PendingAPUpdates
        || option.id === StopPaymentRequestStatusEnum.InquiryAddlInfoRequested;
    }
    this.toggleRequiredValidator('businessDays', this.showBusinessDays);
    this.toggleRequiredValidator('rejectReason', this.showRejectReason);
    this.toggleRequiredValidator('comment', this.isCommentRequired);
  }

  onSubmit(): void {
    this.errorText = null;
    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.BatchUpdateStopPaymentStatuses);
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map(i => i.name),
      this.updateStatusChannelEventHandler.bind(this),
      this.enqueueBatchUpdateStopPaymentStatusValidation.bind(this, channelName),
    );
  }

  private enqueueBatchUpdateStopPaymentStatusValidation(channelName: string) {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.stopPaymentGridLocalData, this.stopPaymentGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;

    if (!searchOptions.containIds || searchOptions.containIds.length < 1) {
      const error = 'Invalid count of Contain Ids in the search options';
      this.store.dispatch(paymentActions.Error({ error }));
      throw new Error(error);
    }

    const updateStopPaymentStatusParam: IStopPaymentUpdateStatusRequestDto = {
      reason: this.form.value.rejectReason,
      waitingPeriod: this.form.value.businessDays,
      stopPaymentRequestStatus: this.form.value.status.id,
      statusEnum: this.form.value.status.id,
      comment: this.form.value.comment,
      checkNumber: this.form.value.checkNumber,
      attachments: this.attachments,
      searchOptions,
    };

    const batchAction: BatchActionDto = {
      entityId: 0,
      entityTypeId: EntityTypeEnum.StopPaymentRequest,
      batchActionFilters: [{ filter: JSON.stringify(updateStopPaymentStatusParam) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.UpdateStatus,
    };

    const batchActionForm = new FormData();
    for (let i = 0; i < this.attachments.length; i++) {
      const doc = this.attachments[i];
      batchActionForm.append('file', doc.file, doc.fileName);
    }

    batchActionForm.append('requestData', JSON.stringify(batchAction));

    this.store.dispatch(paymentActions.EnqueueBatchStopPaymentUpdateStatus({ batchActionForm }));
  }

  private updateStatusChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.isCompletedUpdatingStatus = true;
        this.modal.hide();
        this.statusesUpdated.emit();
        this.toastService.showSuccess('Stop Payment Request status was updated');
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.errorText = data.ErrorMessage;
        this.store.dispatch(paymentActions.BatchUpdateStopPaymentStatusError());
        break;
      default:
        break;
    }
  }

  private toggleRequiredValidator(controlName: string, condition: boolean): void {
    const control = this.form.controls[controlName];
    const maxLength = controlName === 'rejectReason' || controlName === 'comment';
    if (condition && control?.validator) {
      control.setValidators([maxLength ? Validators.maxLength(150) : null, Validators.required, ValidationService.noWhitespaceBeforeTextValidator]);
      control.updateValueAndValidity();
    } else {
      control.setValue(null);
      control.setValidators(maxLength ? Validators.maxLength(150) : null);
      control.updateValueAndValidity();
    }
  }

  private subscribeToStopPaymentGridLocalData(): void {
    this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: GridId.SPR }))
      .pipe(first())
      .subscribe(data => {
        this.stopPaymentGridLocalData = data;
      });
  }

  private subscribeToStopPaymentGridParams(): void {
    this.store.select(selectors.stopPaymentRequestGridParams)
      .pipe(first())
      .subscribe(params => {
        this.stopPaymentGridParams = params;
      });
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
