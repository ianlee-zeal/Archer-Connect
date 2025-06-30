import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import moment from 'moment-timezone';

import * as services from '@app/services';

import { CallCenterWidgetStatus } from '@app/models/enums/call-center-widget-status.enum';
import { CallInfo } from '@app/models/call-info';
import { MessageService } from '@app/services/message.service';
import { EntityTypeDisplayEnum, EntityTypeEnum } from '@app/models/enums';
import { DocumentsListComponent } from '@shared/documents-list/documents-list.component';
import { GridId } from '@app/models/enums/grid-id.enum';
import { Note } from '@app/models/note';
import { CommonHelper } from '@app/helpers';
import { DragAndDropService } from '@app/services';
import * as MsgReader from '@sharpenednoodles/msg.reader-ts';
import { Document, DocumentLink, DocumentType } from '@app/models/documents';
import { EntityType } from '@app/models/entity-type';
import { DocumentType as DocumentTypeEnum } from '@app/models/enums/document-generation';
import { CallWidgetTabsEnum } from '@app/models/enums/call-widget-tabs.enum';
import { NewPhoneCallComponent } from './new-phone-call/new-phone-call.component';
import { CallCenterState } from '../state/reducer';
import * as actions from './state/actions';
import * as selectors from './state/selectors';

@Component({
  selector: 'app-call-widget',
  templateUrl: './call-widget.component.html',
  styleUrls: ['./call-widget.component.scss'],
  animations: [
    trigger('toggleWidget', [
      transition('true <=> false', [
        style({ opacity: '0' }),
        animate('50ms ease-in', style({ opacity: '1' })),
      ]),
    ])
  ],
})
export class CallWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(NewPhoneCallComponent) newPhoneCallComponent: NewPhoneCallComponent;
  @ViewChild(DocumentsListComponent) docListComponent: DocumentsListComponent;

  private intervalId: NodeJS.Timer;

  public callInfo: CallInfo;
  public communicationRecord;
  public callInProgress: boolean = true;
  public readonly controlStatusEnum = CallCenterWidgetStatus;
  public readonly entityTypeId = EntityTypeEnum.Communications;
  public readonly gridId: GridId = GridId.CallWidgetDocuments;

  public activeTab = CallWidgetTabsEnum.Details;
  public callWidgetTabsEnum = CallWidgetTabsEnum;

  public controlStatus: CallCenterWidgetStatus = CallCenterWidgetStatus.expanded;

  public readonly callInfo$ = this.store$.select(selectors.callInfo);
  public readonly callInProgress$ = this.store$.select(selectors.callInProgress);
  public readonly saveCallInProgress$ = this.store$.select(selectors.saveCallInProgress);
  public readonly error$ = this.store$.select(selectors.error);

  private ngUnsubscribe$ = new Subject<void>();

  public get callDuration() {
    const duration = this.callInfo.duration != null
      ? this.callInfo.duration * 1000
      : 0;

    return moment.utc(duration).format('HH:mm:ss').toString();
  }

  public get relatedDocumentsCount() {
    if (this.docListComponent) { return this.docListComponent.addedDocuments.length; }

    return 0;
  }

  constructor(
    private readonly store$: Store<CallCenterState>,
    private readonly toaster: services.ToastService,
    private readonly messageService: MessageService,
    private readonly dragAndDropService: DragAndDropService,
  ) {
  }

  ngOnInit() {
    CommonHelper.windowLog('ngOnInit. Window Log is activated');

    this.callInProgress$.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(inProgress => {
        this.callInProgress = inProgress;
      });

    this.callInfo$.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(info => {
        if (!info) { this.communicationRecord = null; }

        this.callInfo = info;
      });

    this.dragAndDropService.subscribeToDragAndDropEvents(
      'app-call-widget',
      (error: string) => this.store$.dispatch(actions.Error({ error })),
      (
        file: File,
        data: MsgReader.MSGFileData,
        attachments: MsgReader.MSGAttachmentData[],
      ) => {
        const files = [];
        files.push(file);
        for (let i = 0; i < attachments.length; i++) {
          const currentAttachment = data.attachments[i] as any;
          files.push(new File([attachments[i].content], currentAttachment.fileName, { type: currentAttachment.mimeType ? currentAttachment.mimeType : 'application/octet-stream' }));
        }
        this.saveAttachedEmailDocuments(files);
      },
    );
  }

  onActivateRelatedDocumentsTab(): void {
    this.docListComponent.redraw();
  }

  isActiveTab(item: CallWidgetTabsEnum): boolean {
    return item === this.activeTab;
  }

  onChangeTab(tab: CallWidgetTabsEnum): void {
    if (tab == CallWidgetTabsEnum.RelatedDocuments) {
      this.onActivateRelatedDocumentsTab();
    }
    this.activeTab = tab;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.newPhoneCallComponent.setClaimantName(this.callInfo.clientName);
    });

    this.startTimer();
  }

  private saveAttachedEmailDocuments(files: File[]) {
    const documents = [];
    for (let i = 0; i < files.length; i++) {
      const documentType = new DocumentType({
        id: i === 0 ? DocumentTypeEnum.CommunicationEmailMessage : DocumentTypeEnum.CommunicationEmailAttachment,
        name: i === 0 ? 'Email Message' : 'E-mail Attachment',
        isActive: true,
      });
      const document = new Document({
        id: 0,
        description: '',
        documentType,
        documentLinks: [
          new DocumentLink({
            entityId: 0,
            entityType: new EntityType({ id: this.entityTypeId, name: EntityTypeDisplayEnum[this.entityTypeId] }),
          }),
          new DocumentLink({
            entityId: this.callInfo.entityId,
            entityType: new EntityType({ id: EntityTypeEnum.Clients, name: EntityTypeDisplayEnum[EntityTypeEnum.Clients] }),
          }),
        ],
        fileContent: files[i],
        fileNameFull: files[i].name,
      });
      documents.push(document);
    }

    this.docListComponent.addDocuments(documents);
  }

  public onExpand = () => this.changeWidgetStatus(CallCenterWidgetStatus.expanded);
  public onCollapse = () => this.changeWidgetStatus(CallCenterWidgetStatus.collapsed);
  public onMinimize = () => this.changeWidgetStatus(CallCenterWidgetStatus.minimized);
  public onCancel = () => this.cancelCall();
  public onAddAttachment = () => this.docListComponent.add();

  public onFinishCall = (expand: boolean = false) => {
    if (expand) this.onExpand();
    this.finishCall();
  }

  private changeWidgetStatus(status: CallCenterWidgetStatus) {
    if (this.controlStatus === CallCenterWidgetStatus.expanded) {
      // Cache data. The data view model will be destroyed after the view state changes
      this.cacheUserData();
    }

    this.controlStatus = status;
  }

  private finishCall() {
    CommonHelper.windowLog('- Save call -');
    CommonHelper.windowLog('this.newPhoneCallComponent', this.newPhoneCallComponent);

    if (!this.newPhoneCallComponent.validate()) {
      CommonHelper.windowLog('Form is not valid', 'Cannot save');
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    this.stopTimer();
    this.newPhoneCallComponent.setEndTime();
    this.cacheUserData();

    CommonHelper.windowLog('this.communicationRecord.notes. Before assign', this.communicationRecord.notes);
    this.communicationRecord.notes = this.communicationRecord.notes && Array.isArray(this.communicationRecord.notes)
      ? this.communicationRecord.notes.map(Note.toDto)
      : [];
    CommonHelper.windowLog('this.communicationRecord.notes. After assign', this.communicationRecord.notes);
    CommonHelper.windowLog('dispatch(actions.FinishCall', this.communicationRecord);

    this.store$.dispatch(actions.FinishCall({ communicationRecord: this.communicationRecord }));
  }

  private cancelCall() {
    this.messageService
      .showConfirmationDialog('Confirm', 'The details of this call will not be saved')
      .subscribe(answer => {
        if (!answer) { return; }

        this.stopTimer();
        this.store$.dispatch(actions.CancelCall());
      });
  }

  private cacheUserData() {
    CommonHelper.windowLog('cacheUserData', this.callInfo);
    if (this.callInfo) {
      CommonHelper.windowLog('this.newPhoneCallComponent.getModel');
      CommonHelper.windowLog('this.docListComponent', this.docListComponent);
      CommonHelper.windowLog('this.docListComponent?.addedDocuments', this.docListComponent?.addedDocuments);
      this.communicationRecord = this.newPhoneCallComponent.getModel(
        EntityTypeEnum.Clients,
        this.callInfo.entityId,
        this.docListComponent?.addedDocuments,
      );

      CommonHelper.windowLog('this.communicationRecord ', this.communicationRecord);
      CommonHelper.windowLog('this.communicationRecord.notes', this.communicationRecord.Note);
    }
  }

  private startTimer() {
    this.intervalId = setInterval(
      () => this.store$.dispatch(actions.IncreaseCallDuration()),
      1000,
    );
  }

  private stopTimer() {
    clearInterval(this.intervalId);
  }

  public ngOnDestroy(): void {
    CommonHelper.windowLog('ngOnDestroy. Window Log is activated');
    this.stopTimer();

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
