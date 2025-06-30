import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as qsfSweepActions from '@app/modules/qsf-sweep/state/actions';
import * as qsfSweepSelectors from '@app/modules/qsf-sweep/state/selectors';
import { ActionsSubject, Store } from '@ngrx/store';
import { AppState } from '@shared/state';
import { Subject } from 'rxjs';

import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { QSFLienSweepStatus } from '@app/models/enums/qsf-lien-sweep-status.enum';
import { QSFSweepBatch } from '@app/models/qsf-sweep/qsf-sweep-batch';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PermissionService } from '@app/services';
import { PusherService } from '@app/services/pusher.service';
import { ofType } from '@ngrx/effects';
import { Channel } from 'pusher-js';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { QsfSweepHelperService } from '../services/qsf-sweep-helper.service';

@Component({
  selector: 'app-qsf-sweep-channel',
  templateUrl: './qsf-sweep-channel.component.html',
})
export class QsfSweepChannelComponent implements OnInit, OnDestroy {
  @Input() caseId: number;

  protected ngUnsubscribe$ = new Subject<void>();

  private readonly qsfSweepStatusData$ = this.store.select(qsfSweepSelectors.statusData);

  private channel: Channel;
  public readonly isLoading$ = this.store.select(qsfSweepSelectors.isLoading);
  public statusId: QSFLienSweepStatus;
  public channelName: string;

  constructor(
    private readonly store: Store<AppState>,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    protected readonly permissionService: PermissionService,
    private readonly qsfSweepHelperService: QsfSweepHelperService,

    private readonly actionsSubj: ActionsSubject,
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
  }

  public ngOnInit(): void {
    this.subscribeChannelIfInProgress();
    this.subscribeChannelAfterSuccessfulRun();
  }

  private subscribeChannelAfterSuccessfulRun(): void {
    if (!this.permissionService.has(PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.RunQSFSweep))) {
      return;
    }

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(qsfSweepActions.RunQsfSweepComplete),
    ).subscribe(({ channelName, statusId }: { channelName: string, statusId: QSFLienSweepStatus }) => {
      if (this.channel) {
        this.pusher.unsubscribeChannel(this.channel);
      }

      if (!!channelName && (statusId === QSFLienSweepStatus.Created || statusId === QSFLienSweepStatus.Processing)) {
        this.channel = this.pusher.subscribeChannel(
          channelName,
          this.enumToArray.transform(QSFLienSweepStatus).map((i: { id: number; name: string; }) => i.name),
          this.qsfSweepHelperService.runQsfSweepEventHandler.bind(this),
        );
      }
    });
  }

  private subscribeChannelIfInProgress(): void {
    if (!this.permissionService.has(PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.RunQSFSweep))) {
      return;
    }

    this.store.dispatch(qsfSweepActions.CheckCaseSweepStatus({ caseId: this.caseId }));

    this.qsfSweepStatusData$
      .pipe(
        filter((statusData: QSFSweepBatch) => !!statusData),
        distinctUntilChanged((a: QSFSweepBatch, b: QSFSweepBatch) => !!a && !!b && a.channelName === b.channelName
          && a.caseId === b.caseId
          && a.statusId === b.statusId),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((statusData: QSFSweepBatch) => {
        if (!!statusData
          && statusData.channelName
          && (statusData.statusId === QSFLienSweepStatus.Created
            || statusData.statusId === QSFLienSweepStatus.Processing)) {
          if (this.channel) {
            this.pusher.unsubscribeChannel(this.channel);
          }
          this.channel = this.pusher.subscribeChannel(
            statusData.channelName,
            this.enumToArray.transform(QSFLienSweepStatus).map((i: { id: number; name: string; }) => i.name),
            this.qsfSweepHelperService.runQsfSweepEventHandler.bind(this),
            () => {
              this.store.dispatch(qsfSweepActions.SetQsfSweepStatus({ isQsfSweepInProgress: true }));
            },
          );
        }
      });
  }
}
