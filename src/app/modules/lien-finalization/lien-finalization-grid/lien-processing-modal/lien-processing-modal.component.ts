/* eslint-disable no-restricted-globals */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { IdValue, Org } from '@app/models';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { DocumentImport } from '@app/models/documents';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil, filter, first } from 'rxjs/operators';
import { ModalService, ToastService } from '@app/services';
import { EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { LienProcessingStatus } from '@app/models/lien-finalization/lien-processing-status.enum';
import { DownloadDocument } from '@app/modules/shared/state/upload-bulk-document/actions';

import { LienFinalizationTool } from '@app/models/enums/lien-finalization-tool.enum';

import { LienFinalizationPusherMessage } from '@app/models/lien-finalization/lien-finalization-pusher-message';
import { sharedActions } from '@app/modules/shared/state';
import { Channel } from 'pusher-js';
import { PusherService } from '@app/services/pusher.service';

import { StringHelper } from '@app/helpers/string.helper';

import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';

import { LienFinalizationState } from '../../state/reducer';

import { lienProcessingModalSelectors } from './state/selectors';
import * as modalActions from './state/actions';

const defaultError: string = 'Something went wrong. Try again';

@Component({
  selector: 'app-lien-processing-modal',
  templateUrl: './lien-processing-modal.component.html',
  styleUrls: ['./lien-processing-modal.component.scss'],
})
export class LienProcessingModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public readonly dropdownValues$ = this.store.select(lienProcessingModalSelectors.dropdownValues);
  public dropdownValues;
  public form: UntypedFormGroup;

  private ngUnsubscribe$ = new Subject<void>();

  public errorMessage$ = this.store.select(lienProcessingModalSelectors.error);
  private status$ = this.store.select(lienProcessingModalSelectors.status);
  private lienFinalizationRun$ = this.store.select(lienProcessingModalSelectors.lienFinalizationRun);
  public isClosingDisabled$ = this.store.select(lienProcessingModalSelectors.isClosingDisabled);

  readonly awaitedRunActionTypes = [
    modalActions.Error.type,
    modalActions.ShowFoundLiens.type,
  ];

  public status: LienProcessingStatus;
  readonly statuses = LienProcessingStatus;
  public lienFinalizationRun: LienFinalizationRun;

  private channel: Channel;

  public documentImport: DocumentImport;

  public isValidSettings: boolean;
  public isResultAvailable: boolean;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    public lienProcessingModal: BsModalRef,
    private readonly store: Store<LienFinalizationState>,
    private toaster: ToastService,
    private fb: UntypedFormBuilder,
    private pusher: PusherService,
    private modalService: ModalService,
  ) {
    super();
  }

  ngOnInit() {
    this.createForm();
    this.getDropdownValues();

    this.initValues();
  }

  private createForm() {
    this.form = this.fb.group({ collector: [null, Validators.required] });

    super.validate();
  }

  private getDropdownValues() {
    this.store.dispatch(modalActions.GetDropdownValues());
  }

  private initValues(): void {
    this.dropdownValues$.pipe(
      filter(dropdownValues => !!dropdownValues?.collectors),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.dropdownValues = dropdownValues;
      if (this.dropdownValues.collectors.length > 0) {
        this.dropdownValues.collectors = this.dropdownValues.collectors?.map((option: Org) => new IdValue(option.id, `${option.firmId} - ${option.name}`));

        this.form.patchValue({ collector: dropdownValues.collectors[0] });
        this.onCollectorChange(dropdownValues.collectors[0]);
      }
    });

    this.lienFinalizationRun$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(lienFinalizationRun => {
      this.lienFinalizationRun = lienFinalizationRun;
      this.isValidSettings = !!lienFinalizationRun?.collectorOrg?.id;
      this.isResultAvailable = !!lienFinalizationRun && !!lienFinalizationRun.resultDocumentId;
    });

    this.status$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => {
      if (this.status !== result) {
        switch (result) {
          case LienProcessingStatus.Start:
            this.store.dispatch(modalActions.CreateLienFinalization({ collectorOrgId: this.lienFinalizationRun.collectorOrg?.id }));
            break;
          case LienProcessingStatus.Finalize:
            this.onRun();
            break;
          default:
            break;
        }
      }
      this.status = result;
    });
  }

  public onClose(): void {
    this.isClosingDisabled$
      .pipe(first())
      .subscribe(isDisabled => {
        if (!isDisabled) {
          if (this.status !== LienProcessingStatus.None) {
            this.store.dispatch(modalActions.RefreshLienFinalizationGrid());
          }
          this.lienProcessingModal.hide();
        } else {
          this.toaster.showWarning('Lien Finalization Tool is running and can\'t be interrupted.');
        }
      });
  }

  public finalizationStart(): void {
    this.store.dispatch(modalActions.StartFinalization());
  }

  public onRun(): void {
    const collectorOrgId = this.lienFinalizationRun.collectorOrg?.id;

    const channelName = StringHelper.generateChannelName(
      JobNameEnum.LienFinalizationRunCreation,
      collectorOrgId,
      EntityTypeEnum.LienFinalizationRun,
    );

    this.documentImport = new DocumentImport({ channelName });

    this.subscribeToRunFinalizationPusher(channelName, () => {
      this.store.dispatch(modalActions.RunReadyLiens({ batchId: this.lienFinalizationRun.id, lienFinalizationRunCreation: { batchId: this.lienFinalizationRun.id, pusherChannelName: channelName } }));
    });
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
  }

  private subscribeToRunFinalizationPusher(channelName: string, onSubscribedCallback: () => void = null) {
    this.unsubscribeFromChannel();

    this.channel = this.pusher.subscribeChannel(
      channelName,
      ['LienFinalizationTool'],
      this.runFinalizationPusherCallback.bind(this),
      onSubscribedCallback,
    );
  }

  private runFinalizationPusherCallback(data: LienFinalizationPusherMessage): void {
    const eventValue = Number(data.Status);

    if (eventValue === LienFinalizationTool.Completed) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetProgressValues({
        progressValues:
          {
            progressWidth: '100%',
            progressValue: <any>100,
          },
      }));

      this.unsubscribeFromChannel();
      this.store.dispatch(modalActions.ShowFoundLiens({ resultDocId: data.readyDocumentId }));
    }

    if (eventValue === LienFinalizationTool.Failed) {
      this.unsubscribeFromChannel();
      this.displayError(data.error);
    }

    if (eventValue === LienFinalizationTool.Scheduled) {
      this.store.dispatch(modalActions.RefreshLienFinalizationGrid());
      this.lienProcessingModal.hide();
    }

    if ([LienFinalizationTool.Completed, LienFinalizationTool.Failed].includes(eventValue)) {
      this.store.dispatch(modalActions.RefreshLienFinalizationGrid());
      this.onClose();
    }
  }

  private displayError(message?: string) {
    this.store.dispatch(modalActions.ResetOnErrorState());
    this.store.dispatch(modalActions.Error({ error: message ?? defaultError }));
  }

  private resetProgressBar() {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.ResetProgressValues());
  }

  public downloadResults(): void {
    this.store.dispatch(DownloadDocument({ id: this.lienFinalizationRun.resultDocumentId }));
  }

  public onCollectorChange(selectedCollector: IdValue): void {
    this.store.dispatch(modalActions.SetSettings({ settings: { collectorOrg: selectedCollector } }));
  }

  public onClear(controlName: string): void {
    this.form.patchValue({ [controlName]: null, [`${controlName}Id`]: null });
    this.form.updateValueAndValidity();
  }

  ngOnDestroy() {
    this.resetProgressBar();
    this.lienProcessingModal?.hide();

    this.store.dispatch(modalActions.ResetLienProcessingModalState());

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
