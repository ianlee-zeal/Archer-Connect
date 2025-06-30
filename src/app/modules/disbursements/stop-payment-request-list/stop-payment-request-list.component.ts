/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyHelper } from '@app/helpers';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';

import { GridId } from '@app/models/enums/grid-id.enum';
import { StopPaymentStatusForBatchUpdateEnum } from '@app/models/enums/payment-status.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe, EnumToArrayPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { AppState } from '@app/state';
import { ActionsSubject, Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { GridOptions } from 'ag-grid-community';
import * as paymentActions from '@app/modules/payments/state/actions';
import * as paymentSelectors from '@app/modules/payments/state/selectors';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { ModalService, PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PaymentGridRecordLight } from '@app/models';
import { filter, takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { LineLimitedRendererComponent } from '@app/modules/shared/_renderers/line-limited-renderer/line-limited-renderer.component';
import * as rootSelectors from '@app/state/index';
import * as actions from '../state/actions';
import { StopPaymentRequstListActionsRendererComponent } from './stop-payment-request-list-actions-renderer/stop-payment-request-list-actions-renderer.component';
import { StopPaymentUpdateStatusModalComponent } from './stop-payment-update-status-modal/stop-payment-update-status-modal.component';
import { StopPaymentRequestListWarningRendererComponent } from './stop-payment-request-list-warning-renderer/stop-payment-request-list-warning-renderer.component';
import { StopPaymentRequstListAttachmentsLinkRendererComponent } from './stop-payment-request-attachments-link-renderer/stop-payment-request-attachments-link-renderer.component';

@Component({
  selector: 'app-stop-payment-request-list',
  templateUrl: './stop-payment-request-list.component.html',
  styleUrls: ['./stop-payment-request-list.component.scss'],
})
export class StopPaymentRequestListComponent extends ListView implements OnInit {
  readonly gridId: GridId = GridId.SPR;
  readonly actionBar: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    actions: {
      permissions: PermissionService.create(PermissionTypeEnum.StopPaymentRequest, PermissionActionTypeEnum.UpdateStatus),
      options: [
        {
          name: 'Update Status',
          callback: () => this.openUpdateStatusModal(),
          disabled: () => !this.isSomeRowSelected || !this.gridApi?.getDisplayedRowCount(),
          permissions: PermissionService.create(PermissionTypeEnum.StopPaymentRequest, PermissionActionTypeEnum.UpdateStatus),
        },

      ],
    },
  };

  public readonly stopPayment$ = this.store.select(paymentSelectors.stopPaymentRequest);
  private readonly isSomeRowSelected$ = this.store.select(rootSelectors.isSomeRowSelectedByGridId({ gridId: GridId.SPR }));

  public statusEnumOptions: SelectOption[] = this.enumToArrayPipe.transform(StopPaymentStatusForBatchUpdateEnum).map(i => ({ id: i.id, name: i.name }));
  private isSomeRowSelected: boolean;

  readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        width: 40,
        maxWidth: 40,
        checkboxSelection: true,
        pinned: 'left',
        floatingFilter: false,
      },
      {
        headerName: 'Edited?',
        field: 'stopPaymentRequest.requestInformationUpdatedDate',
        sortable: false,
        cellRenderer: 'stopPaymentWarningRendererComponent',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellStyle: { display: 'flex', 'justify-content': 'center' },
        headerClass: 'ag-header-cell-centered',
      },
      {
        headerName: 'Check Verification',
        headerTooltip: 'Check Verification',
        field: 'checkVerificationsCount',
        sortable: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: data => this.yesNoPipe.transform(!!data.value),
      },
      {
        headerName: 'ID',
        field: 'stopPaymentRequestId',
        width: 100,
        maxWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Requestor',
        field: 'stopPaymentRequest.createdBy.displayName',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'stopPaymentRequest.status',
        colId: 'stopPaymentRequest.statusId',
        autoHeight: true,
        wrapText: true,
        sortable: true,
        ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.statusEnumOptions }),
        maxWidth: 175,
        valueFormatter: params => params.node.data.stopPaymentRequest?.statusDescription ?? params.value,
      },
      {
        headerName: 'Status Comments',
        field: 'stopPaymentRequest.statusComment',
        sortable: true,
        cellRenderer: 'lineLimited',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        tooltipValueGetter: params => {
          const length: number = params.value ? params.value.length : 0;
          const maxLength = 25;
          return length > maxLength ? params.value as string : null;
        },
      },
      {
        headerName: 'Date Submitted',
        field: 'stopPaymentRequest.createdDate',
        sortable: true,
        sort: 'desc',
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateOnlyColumnFilter(),
      },
      {
        headerName: 'Project Name',
        field: 'projectName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'QSF Account',
        field: 'payerName',
        colId: 'payerAccount.organization.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payee ID',
        field: 'payeeExternalId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payee Name',
        field: 'payeeName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Reason for Resend',
        field: 'stopPaymentRequest.resendReason',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Specification',
        field: 'stopPaymentRequest.resendReasonSpecification',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Comments',
        field: 'stopPaymentRequest.note',
        sortable: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: data => this.yesNoPipe.transformNull(data.value),
      },
      {
        headerName: 'Sent Date',
        field: 'dateSent',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Check #',
        field: 'referenceNumber',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Amount',
        field: 'amount',
        sortable: true,
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Address Update',
        field: 'stopPaymentRequest.isAddressCorrect',
        sortable: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: data => this.yesNoPipe.transform(!data.value),
      },
      {
        headerName: 'Attachments',
        field: 'attachments',
        width: 230,
        ...AGGridHelper.fixedColumnDefaultParams,
        cellRenderer: 'listAttachments',
        cellRendererParams: {
          onAction: this.downloadAttachments.bind(this),
          showLinkAttachmentsLink: this.showDownloadLinkAttachments.bind(this),
          showDownloadLinkQSFAcctAttachmentsLink: this.showDownloadLinkQSFAcctAttachments.bind(this),
        },
      },
      AGGridHelper.getActionsColumn({ viewHandler: this.openModal.bind(this) }, 70),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    suppressRowClickSelection: true,
    rowSelection: 'single',
    components: {
      buttonRenderer: StopPaymentRequstListActionsRendererComponent,
      linkActionRenderer: LinkActionRendererComponent,
      stopPaymentWarningRendererComponent: StopPaymentRequestListWarningRendererComponent,
      lineLimited: LineLimitedRendererComponent,
      listAttachments: StopPaymentRequstListAttachmentsLinkRendererComponent,
    },
  };

  constructor(
    private readonly store: Store<AppState>,
    private readonly datePipe: DateFormatPipe,
    private readonly enumToArrayPipe: EnumToArrayPipe,
    private readonly yesNoPipe: YesNoPipe,
    public readonly modalService: ModalService,
    private readonly actionsSubj: ActionsSubject,
    private readonly route: ActivatedRoute,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.openSPRModalByURLId();
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(paymentActions.SubmitStopPaymentRequestComplete),
    ).subscribe(() => this.refreshGrid());

    this.isSomeRowSelected$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((isSomeRowSelected: boolean) => {
      this.isSomeRowSelected = isSomeRowSelected;
    });
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    const statusKeyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === 'stopPaymentRequest.statusId');
    if (statusKeyIndex !== -1) {
      this.gridParams.request.filterModel[statusKeyIndex].filterType = 'number';
    }
    this.store.dispatch(actions.GetStopPaymentRequestList({ agGridParams: this.gridParams }));
  }

  openModal(data: PaymentGridRecordLight) {
    this.store.dispatch(paymentActions.OpenStopPaymentRequestModal({ paymentId: data.id, canEdit: false, loadPayment: true }));
  }

  private openUpdateStatusModal(): void {
    const updateStageRef = this.modalService.show(StopPaymentUpdateStatusModalComponent, { class: 'modal-md' });
    updateStageRef.content.statusesUpdated.subscribe(() => {
      this.gridApi.deselectAll();
      // Timeout is necessary or else deselection won't work
      setTimeout(() => {
        this.refreshGrid();
      }, 100);
    });
  }

  private openSPRModalByURLId() {
    const params = this.route.snapshot.children[0]?.params;
    if (params && params.id) {
      this.store.dispatch(paymentActions.GetStopPaymentDetails({ id: params.id }));
      this.stopPayment$.pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(data => !!data),
      ).subscribe(data => {
        this.store.dispatch(paymentActions.OpenStopPaymentRequestModal({ paymentId: data.paymentId, canEdit: false, loadPayment: true }));
      });
    }
  }

  private refreshGrid() {
    if (this.gridApi) {
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  onRowDoubleClicked({ data }) {
    const navSettings = AGGridHelper.getNavSettings(this.gridApi);
    this.store.dispatch(CreatePager({ relatedPage: RelatedPage.StopPaymentRequestList, settings: navSettings }));
    this.store.dispatch(paymentActions.GoToPaymentsDetails({ payload: { id: data.id, entityId: null, entityType: null } }));
  }

  downloadAttachments({ data }, entityTypeId) {
    const stopPaymentRequest = data as PaymentGridRecordLight;
    this.store.dispatch(paymentActions.DownloadAttachments({ id: stopPaymentRequest.stopPaymentRequest.id, entityType: entityTypeId }));
  }

  showDownloadLinkAttachments(e) {
    const stopPaymentRequest = e.data as PaymentGridRecordLight;
    return stopPaymentRequest.stopPaymentRequest.attachmentDocumentIds.length > 0;
  }

  showDownloadLinkQSFAcctAttachments(e) {
    const stopPaymentRequest = e.data as PaymentGridRecordLight;
    return stopPaymentRequest.stopPaymentRequest.qsfAcctDocumentIds.length > 0;
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
