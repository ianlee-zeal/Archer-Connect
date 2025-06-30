import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContextBarElement } from '@app/entities';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { Address, IdValue, Transfer, TransferItemsResponse } from '@app/models';
import { EntityTypeEnum, ExportLoadingStatus, JobNameEnum, DocumentType } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import * as projectActions from '@app/modules/projects/state/actions'
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { AddressPipe, EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridApi, GridOptions, RowClassParams, RowHeightParams } from 'ag-grid-community';
import { filter, takeUntil } from 'rxjs/operators';
import { StringHelper } from '@app/helpers';
import { PusherService } from '@app/services/pusher.service';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import moment from 'moment-timezone';
import { ofType } from '@ngrx/effects';
import { OutputFileType } from '@app/models/enums/document-generation/output-file-type';
import { DocumentTemplate } from '@app/models/documents/document-generators';
import * as exportsActions from '@shared/state/exports/actions';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { ValueWithTooltipRendererComponent } from '@app/modules/shared/_renderers/value-with-tooltip-renderer/value-with-tooltip-renderer.component';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';
import { gridLocalDataByGridId } from '@app/state';
import { DownloadDocuments } from '../../../shared/state/documents-list/actions';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as rootActions from '@app/state/root.actions';
import { Hidable } from '@app/modules/shared/_functions/hidable';
import { TransferRequestItemsListActionsRendererComponent } from '../transfer-request-items-list-actions-renderer/transfer-request-items-list-actions-renderer.component';

@Component({
  selector: 'app-transfer-request-details-modal',
  templateUrl: './transfer-request-details-modal.component.html',
  styleUrls: ['./transfer-request-details-modal.component.scss'],
})
export class TransferRequestDetailsModalComponent extends ListView implements OnInit, OnDestroy {
  public readonly gridId = GridId.GeneratedPayments;
  readonly transferRequestTotal$ = this.store.select(selectors.transferRequestTotal);
  readonly isExporting$ = this.store.select(exportsSelectors.isExporting);
  readonly transferRequestDetailsCounts$ = this.store.select(selectors.transferRequestDetailsCounts);
  readonly transferData$ = this.store.select(projectSelectors.transferData);
  readonly gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));

  transferRequestId: number;
  headerElements: ContextBarElement[];

  private docGenerator: SaveDocumentGeneratorRequest;
  private docTemplate: DocumentTemplate;
  private projectName: string;
  private exportChannelName: string | null;
  public note: string;
  public generateExtractDisabled: boolean = true;
  public showVoidError: boolean = false;
  public additionalDocumentIds: number[];
  public batchActionTemplateId: number;

  public readonly awaitedActionTypes = [
    actions.DownloadTransferExtractComplete,
    actions.Error,
  ];

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    getRowHeight: (params: RowHeightParams<any>) => this.calculateRowHeight(params?.data?.attachments),
    getRowStyle: (params: RowClassParams<any>) => ((params.data?.paymentStatusName === 'Void') ? { background: '#fbd2d3' } : undefined),
    columnDefs: [
      {
        headerName: 'Payee',
        field: 'payeeName',
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true,
      },
      {
        headerName: 'Payee ID',
        field: 'payeeExternalId',
        ...AGGridHelper.nameColumnDefaultParams,
        wrapText: false,
        sortable: true,
      },
      {
        headerName: 'Payment Type',
        field: 'disbursementType',
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true,
      },
      {
        headerName: 'Amount',
        field: 'amount',
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        sortable: true,
      },
      {
        headerName: '# of Claims',
        field: 'numberOfClients',
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        sortable: true,
      },
      {
        headerName: 'Client ID',
        valueGetter: params => {
          const data = params.data as Transfer;
          if (data.numberOfClients > 1) {
            return 'Multiple';
          }

          return data.clientId;
        },
        ...AGGridHelper.nameColumnDefaultParams,
        wrapText: false,
        sortable: true
      },
      {
        headerName: 'Payment Status',
        field: 'paymentStatusName',
        colId: 'status',
        ...AGGridHelper.nameColumnDefaultParams,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Check Memo',
        valueGetter: () => '',
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 135,
        sortable: true,
      },
      {
        headerName: 'Address',
        valueGetter: params => {
          const data = params.data as Transfer;
          const address = new Address();
          address.line1 = data.payeeAddress1;
          address.line2 = data.payeeAddress2;
          address.city = data.payeeAddressCity;
          address.state = data.payeeAddressState;
          address.zip = data.payeeAddressZip;
          return this.addressPipe.transform(address);
        },
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true,
      },
      {
        headerName: 'Bank Name',
        field: 'payeeBankName',
        ...AGGridHelper.nameColumnDefaultParams,
        sortable: true,
      },
      {
        headerName: 'Routing #',
        field: 'payeeRoutingNumber',
        valueFormatter: params => this.formatNumber(params.value),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        sortable: true,
      },
      {
        headerName: 'Account #',
        field: 'payeeAccountNumber',
        valueFormatter: params => this.formatNumber(params.value),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 120,
        sortable: true,
      },
      AGGridHelper.getActionsColumn({
        downloadAttachments: this.onDownloadAdditionalFiles.bind(this),
        showLinkAttachmentsLink: this.showDownloadLinkAttachments.bind(this),
      }, 70, true),
    ],
    components: {
      buttonRenderer: TransferRequestItemsListActionsRendererComponent,
      valueWithTooltip: ValueWithTooltipRendererComponent,
    },

    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      tooltipValueGetter: null,
      autoHeight: false,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    suppressRowClickSelection: true,
  };

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly addressPipe: AddressPipe,
    private readonly modalRef: BsModalRef,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly actionsSubj: ActionsSubject,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.subscribeToGenerateExtractSuccess();
    this.store.dispatch(projectActions.GetTransfersItems({ transferRequestId: this.transferRequestId }));
    this.store.dispatch(actions.GetTransferRequestVoidCounts({ transferRequestId: this.transferRequestId }));
    this.store.dispatch(actions.LoadTemplates({ entityTypeId: EntityTypeEnum.TransferRequest, documentTypes: [DocumentType.EVResponse] }));

    this.transferRequestDetailsCounts$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(transferRequestDetailsCounts => {
        this.generateExtractDisabled = transferRequestDetailsCounts
          ? (transferRequestDetailsCounts.voidedItems > 0 && transferRequestDetailsCounts.otherItems == 0)
          : true;
        this.showVoidError = transferRequestDetailsCounts?.voidedItems > 0;
      });

    this.actionsSubj.pipe(
      ofType(actions.LoadTemplatesComplete),
      filter(action => !!action.data),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      if (action.data?.templates?.length > 0) {
        this.docTemplate = action.data.templates[0];
      }
    });


    this.actionsSubj.pipe(
      ofType(actions.DownloadDocumentComplete, actions.Error),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    });

    this.actionsSubj.pipe(
      ofType(actions.DownloadTransferExtractComplete, actions.Error),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    });

    this.transferData$
    .pipe(filter((transferData: TransferItemsResponse) => transferData !== null && transferData.items !== null))
    .subscribe((transferData: TransferItemsResponse) => {
      this.additionalDocumentIds = transferData.additionalDocumentIds;
      this.batchActionTemplateId = transferData.batchActionTemplateId;
      // let transferItems = [];
      // transferData.items.forEach((transfer) => transferItems.push(... transfer.items.map(transferItem => ({ ...transfer, ...transferItem}))));
      this.setGridRowDataWithDelay(transferData.items, () => {
        this.store.dispatch(rootActions.SetAllRowSelected({ gridId: this.gridId, isAllRowSelected: true }));
        this.selectAllRows();
      });
      this.headerElements = [
        { column: 'Total', valueGetter: () => CurrencyHelper.toUsdFormat({ value: transferData.amount }) },
        { column: 'Requestor', valueGetter: () => `${transferData.firstName} ${transferData.lastName}` },
        { column: 'QSF', valueGetter: () => transferData.organizationName },
        { column: 'Project', valueGetter: () => transferData.caseName },
      ];
    });
  }

  onCancel(): void {
    this.modalRef.hide();
  }

  formatNumber(value: string): string {
    return Hidable.hideNumber(value || '', 9);
  }

  private onDownloadAdditionalFiles(): void {
    this.store.dispatch(DownloadDocuments({ ids: this.additionalDocumentIds }));
  }

  public showDownloadLinkAttachments(): boolean {
    return this.additionalDocumentIds.length > 0;
  }

  generateExtract(): void {

    this.exportChannelName = StringHelper.generateChannelName(JobNameEnum.GenerateExtractTransferRequest, this.transferRequestId, EntityTypeEnum.TransferRequest);
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      this.exportChannelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.extractTransferRequestCallback.bind(this),
      this.downloadTransferRequest.bind(this, this.exportChannelName),
    );
  }

  private subscribeToGenerateExtractSuccess(): void {
    this.actionsSubj.pipe(
      ofType(actions.GenerateExtractComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.docGenerator = action.generationRequest;
    });
  }

  private extractTransferRequestCallback(data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(actions.DownloadTransferExtract({ generatorId: data.id, transferRequestId: this.transferRequestId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(actions.Error({ errorMessage: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  private downloadTransferRequest(channelName: string) {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    const searchOptions = AGGridHelper.getDefaultSearchRequest();
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    const generationRequest = SaveDocumentGeneratorRequest.toDocumentGeneratorRequestDto(
      this.transferRequestId,
      EntityTypeEnum.TransferRequest,
      [{ entityId: this.transferRequestId, entityTypeId: EntityTypeEnum.TransferRequest, searchOptions }],
      [this.docTemplate.id],
      null,
      `${this.projectName} - Transfer Request - ${this.transferRequestId} - ${moment().utc().format('YYYYMMDD')}`,
      OutputFileType.Xlsx,
      channelName,
    );
    this.store.dispatch(actions.GenerateTransferExtract({ transferRequestId: this.transferRequestId, generationRequest, batchActionTemplateId: this.batchActionTemplateId }));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
  }

  onGridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
  }

  private readonly ONE_LINE_HEIGHT: number = 40;
  private readonly CHARS_IN_LINE: number = 20;
  private readonly PADDING: number = 10;

  private calculateRowHeight(attachments: IdValue[]): number {
    if (!attachments) return this.ONE_LINE_HEIGHT;

    let height = this.PADDING;
    attachments.forEach((attachment: IdValue) => {
      let lines = 1;
      if (attachment.name?.length) {
        lines = attachment.name.length / this.CHARS_IN_LINE;
      }
      height += lines * this.ONE_LINE_HEIGHT;
    });
    if (height < this.ONE_LINE_HEIGHT) height = this.ONE_LINE_HEIGHT;
    return attachments ? height : this.ONE_LINE_HEIGHT;
  }

  public ngOnDestroy(): void {
    this.setGridRowDataWithDelay([]);
    this.store.dispatch(actions.ResetPaymentRequestVoidCounts());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
