import { Component } from '@angular/core';
import { StringHelper } from '@app/helpers';
import { DocumentGeneratorsLoading, JobNameEnum } from '@app/models/enums';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PusherService } from '@app/services/pusher.service';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Channel } from 'pusher-js';
import { Subject, takeUntil } from 'rxjs';
import * as actions from '../../state/actions';
import { ClaimantDetailsState } from '../../state/reducer';

@Component({
  selector: 'app-generate-final-status-letter-modal',
  templateUrl: './generate-final-status-letter-modal.component.html',
  styleUrls: ['./generate-final-status-letter-modal.component.scss']
})
export class GenerateFinalStatusLetterModalComponent {

  public claimantId: number;

  public readonly awaitedActionTypes = [
    actions.DownloadResults.type,
    actions.Error.type,
  ];

  private ngUnsubscribe$ = new Subject<void>();
  private pusherChannel: Channel;
  protected errorMessage: string;

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private actionsSubj: ActionsSubject,
    public readonly modal: BsModalRef,
    private readonly pusher: PusherService,
    private readonly enumToArray : EnumToArrayPipe,
  ) { }

  public ngOnInit(): void {
    this.actionsSubj
      .pipe(
        ofType(actions.DownloadResults),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => {
        this.modal.hide();
      });
  }

  onGenerate(): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.GenerateFinalStatusLetter, this.claimantId);
    this.unsubscribePusherChannel();
    this.pusherChannel = this.pusher.subscribeChannel(
        channelName,
        this.enumToArray.transform(DocumentGeneratorsLoading).map(i => i.name),
        this.generateFinalStatusLetterCallback.bind(this),
        () => {
          this.store.dispatch(actions.GenerateFinalStatusLetter({ clientId: this.claimantId, channelName }));
        }
      );
  }

  private generateFinalStatusLetterCallback(data, event: string): void {
    switch (DocumentGeneratorsLoading[event]) {
      case DocumentGeneratorsLoading.Complete:
        this.store.dispatch(actions.DownloadResults());
        break;
      case DocumentGeneratorsLoading.Error:
        this.errorMessage = data.message;
        this.store.dispatch(actions.Error({ error: { message: `Error generating the document: ${data.message}` } }));
        break;
      default:
        break;
    }
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  onCancel(): void {
    this.modal.hide();
  }
}
