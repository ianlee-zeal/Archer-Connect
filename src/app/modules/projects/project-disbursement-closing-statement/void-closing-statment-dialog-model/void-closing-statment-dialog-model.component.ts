import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectsService } from '@app/services';
import { CanceledEnvelopeResponse } from '@app/models/closing-statement/canceledEnvelopeResponse';
import { VoidClosingStatementEnum } from '@app/models/enums/void-closing-statement.enum';
import { IVoidClosingStatementRequest } from '@app/models/closing-statement/void-closing-Statement-request';
import { ActionsSubject, Store } from '@ngrx/store';
import * as fromShared from '@app/state';
import { Subject,  takeUntil } from 'rxjs';
import { ofType } from '@ngrx/effects';
import * as projectActions from '../../state/actions';
import { StringHelper } from '@app/helpers';
import { JobNameEnum } from '@app/models/enums';
import { Channel } from 'pusher-js';
import { PusherService } from '@app/services/pusher.service';
@Component({
  selector: 'app-void-closing-statment-dialog-model',
  templateUrl: './void-closing-statment-dialog-model.component.html',
  styleUrl: './void-closing-statment-dialog-model.component.scss'
})
export class VoidClosingStatmentDialogModelComponent implements OnInit, OnDestroy  {
  @Input() isSelectAllclicked: boolean = false;
  @Input() selectedRows: any = [];
  @Input() refreshParentGrid: () => void;

  public onSubmitClicked: boolean = false;
  public isSuccess = false;
  public isError = false;
  public isLoading = false;
  public isSuccessWithNoAction = false;
  public progress = 0;
  public voidClosingStatementRequest: IVoidClosingStatementRequest;
  public userId: number;
  protected ngUnsubscribe$ = new Subject<void>();
  protected channel: Channel;

  constructor(
    public modal: BsModalRef,
    private projectsService: ProjectsService,
    private store: Store<fromShared.AppState>,
    private actionsSubj: ActionsSubject,
    private readonly pusher: PusherService,
  ) { }

  public ngOnInit(): void {
    this.actionsSubj.pipe(
      ofType(projectActions.SendVoidClosingStatmentCompleted),
      takeUntil(this.ngUnsubscribe$)
    ).subscribe(() => {
      if (this.refreshParentGrid) {
        this.refreshParentGrid();
      }
    });
  }

  public onClose(): void {
    if(this.isSuccess){
       this.store.dispatch(projectActions.SendVoidClosingStatmentCompleted());
    }
    this.modal.hide();
  }

  public onSubmit(): void {
    var user = JSON.parse(localStorage.getItem('user'));
    this.userId = user.id.toString();
    if(this.selectedRows.length > 0) {
        this.onSubmitClicked = true;
        this.isLoading = true;
        this.progress = 0;
        if (this.isSelectAllclicked) {
          this.isLoading = false;
          return;
        }
        this.unsubscribePusherChannel();
        const channelName = StringHelper.generateChannelName(JobNameEnum.VoidClosingStatment);
        this.voidClosingStatementRequest = {
          docIds: this.selectedRows,
          userId: this.userId,
          pusherChannelName : channelName,
        }
        this.channel = this.pusher.subscribeChannel(
          channelName,
          [VoidClosingStatementEnum.ProgressUpdate, VoidClosingStatementEnum.ProgressCompleted],
          (data, event) => this.handleProgressEvent(data, event)
        );
        this.projectsService.VoidClosingStatments(this.voidClosingStatementRequest).subscribe({
          next: (response: CanceledEnvelopeResponse) => {
            this.handleApiResponse(response);
          },
          error: () => {
            this.handleApiError();
          }
        });
    } else {
      this.isError = true;
    }
  }

  private handleProgressEvent(data: any, event: string): void {
    if (event === VoidClosingStatementEnum.ProgressUpdate) {
      this.progress = data;
    } else if (event === VoidClosingStatementEnum.ProgressCompleted) {
      this.progress = 100;
    }
  }

  private unsubscribePusherChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
  }

  private handleApiResponse(response: CanceledEnvelopeResponse): void {
      this.clearLoadingState();
      this.isSuccess = true;
      this.isSuccessWithNoAction = response.message === VoidClosingStatementEnum.SuccessWithNoAction;
  }

  private handleApiError(): void {
      this.clearLoadingState();
      this.isError = true;
      this.progress = 100;
  }

  private clearLoadingState(): void {
    this.isLoading = false;
  }

  public closeError() {
    this.modal.hide();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.unsubscribePusherChannel();
  }
}
