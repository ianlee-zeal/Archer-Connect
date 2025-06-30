/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GridOptions, RowDoubleClickedEvent } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe, ExtendedCurrencyPipe } from '@app/modules/shared/_pipes';
import { ModalService, ToastService } from '@app/services';
import { AppState } from '@app/state';
import { IdValue, PaymentRequestSummary, PaymentRequest } from '@app/models';
import { filter, takeUntil } from 'rxjs/operators';
import { JobNameEnum, JobStatus } from '@app/models/enums';
import { StringHelper } from '@app/helpers';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { ViewNoteModalComponent } from '@app/modules/shared/view-note-modal/view-note-modal.component';
import { PusherService } from '../../../services/pusher.service';
import * as actions from '../state/actions';
import { DisbursementsListActionsRendererComponent } from './disbursements-list-actions-renderer/disbursements-list-actions-renderer.component';
import { DisbursementDetailsModalComponent } from '../disbursement-details-modal/disbursement-details-modal.component';
import { EntityTypeEnum } from '../../../models/enums/entity-type.enum';

@Component({
  selector: 'app-disbursements-list',
  templateUrl: './disbursements-list.component.html',
  styleUrls: ['./disbursements-list.component.scss'],
})
export class DisbursementsListComponent extends ListView implements OnInit {
  readonly gridId: GridId = GridId.Disbursements;
  readonly actionBar: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    generatingDocuments: { hidden: () => !this.isGenerating },
  };
  public paymentRequestStatusDropdownValues: IdValue[] = [];
  private readonly paymentRequestStatusDropdownValues$ = this.store.select<IdValue[]>(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.PaymentRequest }));

  bsModalRef: BsModalRef;
  isGenerating = false;

  readonly gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'paymentRequestId',
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
        ...AGGridHelper.getDropdownColumnFilter({ options: this.paymentRequestStatusDropdownValues }),
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
        valueGetter: params => this.currencyPipe.transform((params.data as PaymentRequestSummary).paymentAmount),
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
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    components: {
      buttonRenderer: DisbursementsListActionsRendererComponent,
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
    this.openPaymentDetailsModalByURLId();
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.PaymentRequest }));
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));

    this.paymentRequestStatusDropdownValues$.pipe(
      filter(item => item && item.length && !this.paymentRequestStatusDropdownValues.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.paymentRequestStatusDropdownValues.push(...dropdownValues);
    });
  }

  private openPaymentDetailsModalByURLId() {
    const params = this.route.snapshot.children[0]?.params;
    if (params && params.id) {
      this.showPaymentDetailsModal(params.id, false);
    }
  }

  private onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    this.onView(event.data as PaymentRequestSummary);
  }

  public onViewNote({ data }): void {
    const paymentRequestSummaryData = data as PaymentRequestSummary;
    this.modalService.show(ViewNoteModalComponent, { initialState: { note: paymentRequestSummaryData.note } });
  }

  public showViewNoteLink(e): boolean {
    return !!(e.data as PaymentRequestSummary).note;
  }

  private onView(data: PaymentRequestSummary) {
    this.showPaymentDetailsModal(data.paymentRequestId, data.isManual);
  }

  private showPaymentDetailsModal(paymentRequestId: number, isManual: boolean) {
    this.bsModalRef = this.modalService.show(DisbursementDetailsModalComponent, {
      initialState: { paymentRequestId, isManual },
      class: 'disbursement-details-modal',
    });
  }

  private downloadAttachments(data: PaymentRequestSummary) {
    this.store.dispatch(actions.DownloadAttachments({ id: data.paymentRequestId }));
  }

  showDownloadLinkAttachments(e) {
    const paymentRequest = e.data as PaymentRequestSummary;
    return paymentRequest.attachmentDocumentIds.length > 0;
  }

  private onGenerateDocuments(data: PaymentRequestSummary) {
    this.isGenerating = true;
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
    const channelName = StringHelper.generateChannelName(
      JobNameEnum.GeneratePaymentDocumentsByPaymentRequestId,
      data.paymentRequestId,
      EntityTypeEnum.DocumentGeneration,
    );
    this.channel = this.pusher.subscribeChannel(
      channelName,
      Object.keys(JobStatus).filter(key => !isNaN(Number(JobStatus[key.toString()]))),
      this.documentsGeneratedCallback.bind(this),
      () => this.store.dispatch(actions.StartGeneratePaymentDocumentsJob({
        request: {
          paymentRequestId: data.paymentRequestId,
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
    this.store.dispatch(actions.GetDisbursementsList({ agGridParams }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.bsModalRef?.hide();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
