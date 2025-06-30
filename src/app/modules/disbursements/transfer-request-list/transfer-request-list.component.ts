/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StringHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe, ExtendedCurrencyPipe } from '@app/modules/shared/_pipes';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { AppState } from '@app/state';
import { GridOptions, RowDoubleClickedEvent } from 'ag-grid-community';

import { ModalService, ToastService } from '@app/services';
import { EntityTypeEnum, JobNameEnum, JobStatus } from '@app/models/enums';
import { IdValue, PaymentRequest, TransferRequestSummary } from '@app/models';
import { filter, takeUntil } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import * as actions from '../state/actions';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PusherService } from '@app/services/pusher.service';
import * as rootActions from '@app/state/root.actions';
import { ViewNoteModalComponent } from '@app/modules/shared/view-note-modal/view-note-modal.component';
import { TransferRequestDetailsModalComponent } from './transfer-request-details-modal/transfer-request-details-modal.component'
import { TransferRequestListActionsRendererComponent } from './transfer-request-list-actions-renderer/transfer-request-list-actions-renderer.component'
import { Store } from '@ngrx/store'
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-transfer-request-list',
  templateUrl: './transfer-request-list.component.html',
  styleUrls: ['./transfer-request-list.component.scss'],
})
export class TransferRequestListComponent extends ListView implements OnInit {
  readonly gridId: GridId = GridId.TransferRequests;
  readonly actionBar: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    generatingDocuments: { hidden: () => !this.isGenerating },
  };
  public transferRequestStatusDropdownValues: IdValue[] = [];
  private readonly transferRequestStatusDropdownValues$ = this.store.select<IdValue[]>(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.TransferRequest }));

  bsModalRef: BsModalRef;
  isGenerating = false;

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'transferRequestId',
        width: 50,
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Requestor',
        field: 'requesterName',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'statusName',
        colId: 'statusId',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.transferRequestStatusDropdownValues }),
        maxWidth: 175,
      },
      {
        headerName: 'Project Name',
        field: 'caseName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'QSF Account',
        field: 'qsfAccount',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Count',
        field: 'paymentCount',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 80,
      },
      {
        headerName: 'Amount',
        field: 'paymentAmount',
        sortable: true,
        valueGetter: params => this.currencyPipe.transform((params.data as TransferRequestSummary).paymentAmount),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Date Submitted',
        field: 'submittedDate',
        sortable: true,
        sort: 'desc',
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Notes',
        field: 'note',
        width: 100,
        cellRenderer: 'linkActionRenderer',
        valueGetter: () => 'View Note',
        cellRendererParams: {
          onAction: this.onViewNote.bind(this),
          showLink: this.showViewNoteLink.bind(this),
        },
      },
      AGGridHelper.getActionsColumn({
        viewHandler: this.onView.bind(this),
        downloadHandler: this.onGenerateDocuments.bind(this),
        downloadAttachments: this.downloadAttachments.bind(this),
        showLinkAttachmentsLink: this.showDownloadLinkAttachments.bind(this),
        disabled: () => this.isGenerating,
      }, 120),
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    components: {
      buttonRenderer: TransferRequestListActionsRendererComponent,
      linkActionRenderer: LinkActionRendererComponent,
    },
  };

  constructor(
    private readonly store: Store<AppState>,
    private readonly route: ActivatedRoute,
    private readonly modalService: ModalService,
    private readonly datePipe: DateFormatPipe,
    private readonly currencyPipe: ExtendedCurrencyPipe,
    private readonly pusher: PusherService,
    private readonly toastService: ToastService,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.openTransferDetailsModalByURLId();
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.TransferRequest }));
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));

    this.transferRequestStatusDropdownValues$.pipe(
      filter(item => item && item.length && !this.transferRequestStatusDropdownValues.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.transferRequestStatusDropdownValues.push(...dropdownValues);
    });
  }

  private openTransferDetailsModalByURLId() {
    const params = this.route.snapshot.children[0]?.params;
    if (params && params.id) {
      this.showTransferDetailsModal(params.id);
    }
  }

  private onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    this.onView(event.data as TransferRequestSummary);
  }

  public onViewNote({ data }): void {
    const transferRequestSummaryData = data as TransferRequestSummary;
    this.modalService.show(ViewNoteModalComponent, { initialState: { note: transferRequestSummaryData.note } });
  }

  public showViewNoteLink(e): boolean {
    return !!(e.data as TransferRequestSummary).note;
  }

  private onView(data: TransferRequestSummary) {
    this.showTransferDetailsModal(data.transferRequestId);
  }

  private showTransferDetailsModal(transferRequestId: number) {
    this.bsModalRef = this.modalService.show(TransferRequestDetailsModalComponent, {
      initialState: { transferRequestId },
      class: 'disbursement-details-modal',
    });
  }

  private downloadAttachments(data: TransferRequestSummary) {
    this.store.dispatch(actions.DownloadTransferAttachments({ id: data.transferRequestId }));
  }

  showDownloadLinkAttachments(e) {
    const paymentRequest = e.data as TransferRequestSummary;
    return paymentRequest.attachmentDocumentIds.length > 0;
  }

  private onGenerateDocuments(data: TransferRequestSummary) {
    this.isGenerating = true;
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
    const channelName = StringHelper.generateChannelName(
      JobNameEnum.GenerateTransferDocumentsByTransferRequestId,
      data.transferRequestId,
      EntityTypeEnum.DocumentGeneration,
    );
    this.channel = this.pusher.subscribeChannel(
      channelName,
      Object.keys(JobStatus).filter(key => !isNaN(Number(JobStatus[key.toString()]))),
      this.documentsGeneratedCallback.bind(this),
      () => this.store.dispatch(actions.StartGenerateTransferDocumentsJob({
        request: {
          paymentRequestId: data.transferRequestId,
          channelName,
        },
      })),
    );
  }

  private documentsGeneratedCallback(data: PaymentRequest | string, event: string) {
    switch (event) {
      case JobStatus[JobStatus.LoadingCompleted]: {
        const result = data as PaymentRequest;
        if (result.ProcessDocId || result.Id) {
          this.toastService.showSuccess('Documents generated successfully');
        } else {
          this.toastService.showError(`Something went wrong: ${data ? data as string : 'Completed with empty response.'}`);
        }
        this.isGenerating = false;
        break;
      }
      case JobStatus[JobStatus.Error]:
        this.store.dispatch(actions.Error({ errorMessage: data as string }));
        this.isGenerating = false;
        break;
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    this.store.dispatch(actions.GetTransferRequestsList({ agGridParams }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.bsModalRef?.hide();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
