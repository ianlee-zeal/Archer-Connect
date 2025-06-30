import { Dictionary } from '@app/models/utils';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContextBarElement, IGridActionRendererParams } from '@app/entities';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { Address, IdValue, PaymentRequestDetails } from '@app/models';
import { EntityTypeEnum, ExportLoadingStatus, JobNameEnum, PaymentMethodEnum, DocumentType } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Hidable } from '@app/modules/shared/_functions/hidable';
import { AddressPipe, EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridOptions, RowClassParams, RowHeightParams } from 'ag-grid-community';
import { filter, takeUntil } from 'rxjs/operators';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ILinkActionsRendererParams, LinkActionsRendererComponent } from '@app/modules/shared/_renderers/link-actions-renderer/link-actions-renderer.component';
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
import { CommonHelper } from '../../../helpers/common.helper';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ExtendedCurrencyPipe } from '../../shared/_pipes/extended-currency.pipe';
import { DownloadDocument } from '../../shared/state/upload-bulk-document/actions';
import { DisbursementsPaymentListActionsRendererComponent } from './disbursements-payment-list-actions-renderer/disbursements-payment-list-actions-renderer.component';

@Component({
  selector: 'app-disbursement-details-modal',
  templateUrl: './disbursement-details-modal.component.html',
  styleUrls: ['./disbursement-details-modal.component.scss'],
})
export class DisbursementDetailsModalComponent extends ListView implements OnInit, OnDestroy {
  public readonly gridId = GridId.PaymentSummaryDetails;
  readonly paymentRequestTotal$ = this.store.select(selectors.paymentRequestTotal);
  readonly isExporting$ = this.store.select(exportsSelectors.isExporting);
  readonly paymentRequestDetailsCounts$ = this.store.select(selectors.paymentRequestDetailsCounts);

  paymentRequestId: number;
  headerElements: ContextBarElement[];
  isManual: boolean;

  private floatingFilter = false;
  private docGenerator: SaveDocumentGeneratorRequest;
  private docTemplate: DocumentTemplate;
  private projectId: number;
  private qsfName: string;
  public note: string;
  public generateExtractDisabled: boolean = true;
  public showVoidError: boolean = false;

  public readonly awaitedActionTypes = [
    actions.DownloadPaymentExtractComplete,
    actions.Error,
  ];
  generatingPayments = new Dictionary<number, number>();

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    getRowHeight: (params: RowHeightParams<any>) => this.calculateRowHeight(params?.data?.attachments),
    getRowStyle: (params: RowClassParams<any>) => ((params.data?.paymentStatusName === 'Void') ? { background: '#fbd2d3' } : undefined),
    columnDefs: [
      {
        headerName: 'Payee',
        field: 'payee',
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 170,
        width: 170,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Payee ID',
        field: 'payeeExternalId',
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 110,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Payment Reference Number',
        field: 'referenceNumber',
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 200,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Payment Status',
        field: 'paymentStatusName',
        ...AGGridHelper.nameColumnDefaultParams,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Payment Type',
        field: 'paymentItemTypeName',
        ...AGGridHelper.nameColumnDefaultParams,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Amount',
        field: 'amount',
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: 'valueWithTooltip',
        valueGetter: params => CurrencyHelper.toUsdFormat({ value: params.data.amount }),
        sortable: true,
      },

      {
        headerName: '# of Claims',
        field: 'numberOfClients',
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Client Id',
        field: 'clientId',
        ...AGGridHelper.fixedColumnDefaultParams,
        maxWidth: 100,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Payment Method',
        field: 'paymentMethod',
        width: 140,
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 140,
        cellRenderer: 'valueWithTooltip',
        valueGetter: params => PaymentMethodEnum[params.data.paymentMethod],
        sortable: true,
      },
      {
        headerName: 'Check Memo',
        field: 'checkMemo',
        ...AGGridHelper.nameColumnDefaultParams,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Address',
        valueGetter: params => {
          const data = params.data as PaymentRequestDetails;
          const address = new Address();
          address.line1 = data.payeeAddress1;
          address.line2 = data.payeeAddress2;
          address.city = data.payeeAddressCity;
          address.state = data.payeeAddressState;
          address.zip = data.payeeAddressZip;
          return this.addressPipe.transform(address);
        },
        cellRenderer: 'valueWithTooltip',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Bank Name',
        field: 'payerBankName',
        ...AGGridHelper.nameColumnDefaultParams,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Routing #',
        field: 'payeeRoutingNumber',
        valueGetter: params => this.formatNumber(params.data.payeeRoutingNumber),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        cellRenderer: 'valueWithTooltip',
      },
      {
        headerName: 'Account #',
        field: 'payeeAccountNumber',
        valueGetter: params => this.formatNumber(params.data.payeeAccountNumber),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 120,
        cellRenderer: 'valueWithTooltip',
      },
      {
        headerName: 'Attachment',
        field: 'attachments',
        cellRenderer: 'linkActionsRenderer',
        cellRendererParams: params => ({
          items: params.value,
          onActionClick: (item: IdValue) => this.downloadDocument(item.id),
        } as ILinkActionsRendererParams),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 200,
        width: 200,
        autoHeight: false,
      },
      AGGridHelper.getActionsColumn({
        downloadHandler: this.onGenerateDocuments.bind(this),
        hidden: (data: PaymentRequestDetails) => data.payeeEntityTypeId !== EntityTypeEnum.Clients && data.payeeEntityTypeId !== EntityTypeEnum.ClientContacts && data.payeeEntityTypeId !== EntityTypeEnum.ClientContactOnCheck,
        inProgress: (data: PaymentRequestDetails) => (!CommonHelper.isNullOrUndefined(data) ? this.generatingPayments.containsKey(data.paymentId) : false),
      } as IGridActionRendererParams<PaymentRequestDetails>, 70),
    ],
    components: {
      linkActionsRenderer: LinkActionsRendererComponent,
      buttonRenderer: DisbursementsPaymentListActionsRendererComponent,
      valueWithTooltip: ValueWithTooltipRendererComponent,
    },
    // floatingFilter: this.floatingFilter,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      tooltipValueGetter: null,
      autoHeight: false,
    },
  };

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly addressPipe: AddressPipe,
    private readonly modalRef: BsModalRef,
    private readonly currencyPipe: ExtendedCurrencyPipe,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly actionsSubj: ActionsSubject,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.paymentRequestTotal$
      .pipe(filter(total => total !== null))
      .subscribe(total => {
        this.headerElements = [
          { column: 'Total', valueGetter: () => this.currencyPipe.transform(total.totalAmount) },
          { column: 'Requestor', valueGetter: () => `${total.userFirstName || ''} ${total.userLastName || ''}` },
          { column: 'QSF', valueGetter: () => total.qsfCompanyName },
          { column: 'Project Name', valueGetter: () => total.caseName },
        ];
        const {caseId, qsfCompanyAltName, qsfCompanyName, note} = total;
        this.projectId = caseId;
        this.qsfName = qsfCompanyAltName || qsfCompanyName;
        this.note = note?.note;
      });
    this.subscribeToGenerateExtractSuccess();
    this.store.dispatch(actions.GetPaymentRequestTotal({ paymentRequestId: this.paymentRequestId }));
    this.store.dispatch(actions.GetPaymentRequestVoidCounts({ paymentRequestId: this.paymentRequestId }));
    this.store.dispatch(actions.LoadTemplates({ entityTypeId: EntityTypeEnum.PaymentRequest, documentTypes: [DocumentType.EVResponse] }));

    this.paymentRequestDetailsCounts$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(paymentRequestDetailsCounts => {
        this.generateExtractDisabled = paymentRequestDetailsCounts
          ? (paymentRequestDetailsCounts.voidedItems > 0 && paymentRequestDetailsCounts.otherItems == 0)
          : true;
        this.showVoidError = paymentRequestDetailsCounts?.voidedItems > 0;
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
      ofType(actions.StartGeneratePaymentDocumentsJobComplete, actions.StartGeneratePaymentDocumentsJobError),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.generatingPayments.remove(action.paymentId);
      if (!this.generatingPayments.count()) {
        this.store.dispatch(actions.GetPaymentRequestDetails({
          agGridParams: this.gridParams,
          paymentRequestId: this.paymentRequestId,
        }));
      }
    });

    this.actionsSubj.pipe(
      ofType(actions.DownloadDocumentComplete, actions.Error),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    });

    this.actionsSubj.pipe(
      ofType(actions.DownloadPaymentExtractComplete, actions.Error),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    });
  }

  onCancel(): void {
    this.modalRef.hide();
  }

  generateExtract(): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.GenerateExtractPaymentRequest, this.paymentRequestId, EntityTypeEnum.PaymentRequest);
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.extractPaymentRequestCallback.bind(this),
      this.downloadPaymentRequest.bind(this, channelName),
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

  private extractPaymentRequestCallback(data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(actions.DownloadPaymentExtract({ generatorId: this.docGenerator.id, paymentRequestId: this.paymentRequestId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(actions.Error({ errorMessage: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  private downloadPaymentRequest(channelName: string) {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    const searchOptions = AGGridHelper.getDefaultSearchRequest();
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    const generationRequest = SaveDocumentGeneratorRequest.toDocumentGeneratorRequestDto(
      this.paymentRequestId,
      EntityTypeEnum.PaymentRequest,
      [{ entityId: this.paymentRequestId, entityTypeId: EntityTypeEnum.PaymentRequest, searchOptions }],
      [this.docTemplate.id],
      null,
      `${this.qsfName} - ${this.projectId} - PR - ${this.paymentRequestId} - ${moment().utc().format('YYYYMMDD')}`,
      OutputFileType.Xlsx,
      channelName,
    );
    this.store.dispatch(actions.GenerateExtract({ paymentRequestId: this.paymentRequestId, generationRequest: generationRequest, isManual: this.isManual }));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.store.dispatch(actions.GetPaymentRequestDetails({
      agGridParams: params,
      paymentRequestId: this.paymentRequestId,
    }));
  }

  private formatNumber(value: string) {
    return Hidable.hideNumber(value || '', 9);
  }

  private downloadDocument(id: number): void {
    this.store.dispatch(DownloadDocument({ id }));
  }

  private onGenerateDocuments(data: PaymentRequestDetails) {
    this.generatingPayments.setValue(data.paymentId, null);
    const channelName = StringHelper.generateChannelName(
      JobNameEnum.GeneratePaymentDocumentsByPaymentId,
      data.payeeId,
      EntityTypeEnum.DocumentGeneration,
    );
    this.store.dispatch(actions.StartGeneratePaymentDocumentsJob({
      request: {
        paymentRequestId: this.paymentRequestId,
        channelName,
        paymentId: data.paymentId,
      },
    }));
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
    this.store.dispatch(actions.ResetPaymentRequestVoidCounts());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
