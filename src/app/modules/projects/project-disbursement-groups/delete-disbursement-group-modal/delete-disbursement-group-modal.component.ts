import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import * as projectActions from '../../state/actions';
import * as projectSelectors from '../../state/selectors';
import { PusherService } from '@app/services/pusher.service';
import { Channel } from 'pusher-js';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { BatchActionDto } from '@app/models/batch-action/batch-action';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { ProjectsCommonState } from '../../state/reducer';
import { EntityTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-delete-disbursement-group-modal',
  templateUrl: './delete-disbursement-group-modal.component.html',
  styleUrls: ['./delete-disbursement-group-modal.component.scss'],
})
export class DeleteDisbursementGroupModalComponent implements OnInit, OnDestroy {
  public disbursementGroupId: number;
  public projectId: number;
  public errorMessage$ = this.store.select(projectSelectors.errorMessage);
  public ngDestroyed$ = new Subject<void>();
  public disabledDelete: boolean;

  public deleteChannel: string;
  private channel: Channel;
  // eslint-disable-next-line no-restricted-globals
  readonly pusherEvents = Object.keys(BatchActionStatus).filter((key: string) => !isNaN(Number(BatchActionStatus[key.toString()])));
  public onPusherMessageReceived: (channelName: string) => void;

  readonly awaitedSubmitActionTypes = [
    projectActions.DeleteDisbursementGroupSuccess.type,
    projectActions.DeleteDisbursementGroupError.type,
    projectActions.EnqueueDeleteDisbursementGroup.type
  ];

  constructor(
    private store: Store<ProjectsCommonState>,
    public modal: BsModalRef,
    private pusher: PusherService,
    private actionsSubj: ActionsSubject,
  ) {}

  ngOnInit(): void {
    this.disabledDelete = false;
    this.deleteChannel = `DeleteDisbursementGroup_${this.disbursementGroupId}`;
    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(projectActions.DeleteDisbursementGroupError),
    ).subscribe(() => {
      this.disabledDelete = true;
    });
  }

  public onClose(): void {
    this.modal.hide();
  }

  public onDelete(): void {
    this.disabledDelete = true;
    this.subscribeToPusher( this.deleteChannel, () => this.DeleteDisbursementGroup(this.deleteChannel));
  }

  private DeleteDisbursementGroup(channelName) {
    const batchAction: BatchActionDto = {
      entityId: this.disbursementGroupId,
      entityTypeId: EntityTypeEnum.DisbursementGroups,
      batchActionFilters: [{filter:""}],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.DeleteDisbursementGroup,
    };

    this.store.dispatch(projectActions.EnqueueDeleteDisbursementGroup({ batchAction }));
  }

  private pusherCallback(data: GridPusherMessage, event): void {
    switch (event) {
      case BatchActionStatus[BatchActionStatus.Error]:
        this.resetChannel();
        this.displayError(data.ErrorMessage);
        this.disabledDelete = true;
        break;
      case BatchActionStatus[BatchActionStatus.Complete]:
        this.resetChannel();
        this.store.dispatch(projectActions.DeleteDisbursementGroupSuccess({projectId: this.projectId, modal: this.modal}));
        break;
        // no default
    }
  }

  private displayError(message?: string): void {
    this.store.dispatch(projectActions.DeleteDisbursementGroupError({ errorMessage: message }));
  }

  private resetChannel(): void {
    this.pusher.unsubscribeChannel(this.channel);
    this.channel = null;
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.DeleteDisbursementGroupError({ errorMessage: null }));
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }

  private subscribeToPusher(channelName: string, callback: () => void = null): void {
    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.pusherEvents,
      this.pusherCallback.bind(this)
    );

    if (this.onPusherMessageReceived) {
      this.onPusherMessageReceived(channelName);
    }

    if (callback) {
      callback();
    }
  }
}
