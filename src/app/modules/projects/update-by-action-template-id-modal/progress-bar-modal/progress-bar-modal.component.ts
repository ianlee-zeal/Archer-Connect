import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PusherService } from '@app/services/pusher.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Channel } from 'pusher-js';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-progress-bar-modal',
  templateUrl: './progress-bar-modal.component.html',
  styleUrls: ['./progress-bar-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProgressBarModalComponent implements OnInit, OnDestroy {
  public progressWidth: string = '0%';
  public progressValue: string = '0';
  public channelName: string;
  public pusherChannel: Channel;
  private readonly ngUnsubscribe$ = new Subject<void>();
  constructor(
    public bsModalRef: BsModalRef,
    private pusher: PusherService,
    private enumToArray: EnumToArrayPipe,
  ) { }

  ngOnInit(): void {
    this.pusherChannel = this.pusher.subscribeChannel(
      this.channelName,
      this.enumToArray.transform(BatchActionStatus).map(i => i.name),
      this.validationChannelEventHandler.bind(this),
    );
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  private validationChannelEventHandler(data: GridPusherMessage, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Loading:
      case BatchActionStatus.Validating: {
        const currentPercentage = data.CurrentPercentage.toFixed(2);
        this.progressWidth = `${currentPercentage}%`;
        this.progressValue = <any>currentPercentage;
        break;
      }
      default:
        break;
    }
  }

  ok() {
    this.bsModalRef.hide();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.unsubscribePusherChannel();
  }
}
