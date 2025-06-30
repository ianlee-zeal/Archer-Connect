import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Channel } from 'pusher-js';

import { StringHelper } from '@app/helpers';
import { DocumentGeneratorsLoading, JobNameEnum } from '@app/models/enums';
import { OutputFileType } from '@app/models/enums/document-generation/output-file-type';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PusherService } from '@app/services/pusher.service';
import { ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ToastService } from '../../../services';
import { SelectOption } from '../_abstractions/base-select';
import * as fromShared from '../state';
import * as actions from '../state/document-generation/actions';
import { SharedDocumentGenerationState } from '../state/document-generation/reducer';

const { sharedSelectors, sharedActions } = fromShared;

@Component({
  selector: 'app-document-generation-modal',
  templateUrl: './document-generation-modal.component.html',
  styleUrls: ['./document-generation-modal.component.scss'],
})
export class DocumentGenerationModalComponent implements OnInit, OnDestroy {
  @Input() public entityProperty: string;

  public state$ = this.store.select(sharedSelectors.documentGenerationSelectors.root);
  public state: SharedDocumentGenerationState;
  public allOutputFileTypesOptions: SelectOption[] = this.enumToArrayPipe.transform(OutputFileType);
  public outputTypeOptions: SelectOption[] = this.enumToArrayPipe.transform(OutputType);

  readonly awaitedCheckActionTypes = [
    actions.Error.type,
  ];

  public ngUnsubscribe$ = new Subject<void>();

  private channel: Channel;

  constructor(
    private modal: BsModalRef,
    private pusher: PusherService,
    private store: Store<fromShared.AppState>,
    private enumToArrayPipe: EnumToArrayPipe,
    private readonly actionsSubj: ActionsSubject,
    private readonly toaster: ToastService,
  ) { }

  public ngOnInit(): void {
    this.state$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(
      item => {
        this.state = item;
      },
    );

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.Error),
    ).subscribe(data => {
      this.toaster.showError(data.error);
      this.store.dispatch(actions.UpdateProgress({ progress: { message: data.error, width:100, error:true } }));
    });

    let outputTypeOptions: SelectOption[] = [];
    if (this.state.data.validOutputTypeOptions?.length > 0) {
      this.state.data.validOutputTypeOptions.forEach(o => {
        outputTypeOptions.push(this.outputTypeOptions.find(x => x.id == o));
      });
    } else {
      outputTypeOptions = this.outputTypeOptions;
    }
    this.store.dispatch(sharedActions.documentGenerationActions.LoadDefaultData({
      outputTypeOptions,
      allOutputFileTypesOptions: this.allOutputFileTypesOptions,
    }));
  }

  ngOnDestroy(): void {
    if (this.channel) this.pusher.unsubscribeChannel(this.channel);
  }

  public onClose(): void {
    this.modal.hide();
  }

  public onBack(): void {
    this.store.dispatch(sharedActions.documentGenerationActions.SetModalStage({ incr: -1 }));
  }

  public onNext(): void {
    this.store.dispatch(sharedActions.documentGenerationActions.SetModalStage({ incr: 1 }));
  }

  public onGenerate(): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportAdvancedGenerationModal, this.state.entityId, this.state.entityTypeId ?? this.state.id);
    if (this.channel) this.pusher.unsubscribeChannel(this.channel);
    const events = Object.keys(DocumentGeneratorsLoading).filter(key => !isNaN(Number(DocumentGeneratorsLoading[key.toString()])));
    this.channel = this.pusher.subscribeChannel(channelName, events, this.pusherCallback.bind(this), this.generateCallback.bind(this, channelName));
    this.store.dispatch(sharedActions.documentGenerationActions.SetModalStage({ incr: 1 }));
  }

  private generateCallback(channelName: string) {
    this.store.dispatch(sharedActions.documentGenerationActions.GenerateDocuments({ channelName }));
  }

  private pusherCallback(data, event: DocumentGeneratorsLoading): void {
    let message: string = '';
    let width: number = 10;
    let complete: boolean = false;
    let error: boolean = false;

    switch ((<any>DocumentGeneratorsLoading[event])) {
      case DocumentGeneratorsLoading.Pending:
        message = 'Queueing job for processing...';
        width = 10;
        break;

      case DocumentGeneratorsLoading.Loading:
        message = data.message;
        width = 10 + (80 * (data.percentage / 100));
        break;

      case DocumentGeneratorsLoading.Downloading:
        message = 'Saving results...';
        width = 90;
        break;

      case DocumentGeneratorsLoading.Complete:
        message = 'Downloading validation results...';
        width = 100;
        complete = true;
        this.store.dispatch(actions.DownloadResults());
        if (this.state.finishedProcessCallback) {
          this.state.finishedProcessCallback();
        }
        break;

      case DocumentGeneratorsLoading.Error:
        message = data.message;
        width = 100;
        error = true;
        break;
    }

    this.store.dispatch(actions.UpdateProgress({ progress: { message, width, complete, error } }));
  }
}
