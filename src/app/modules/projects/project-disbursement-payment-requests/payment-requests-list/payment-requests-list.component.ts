import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe, ExtendedCurrencyPipe } from '@app/modules/shared/_pipes';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ModalService, PermissionService } from '@app/services';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { IdValue, PaymentRequestSummary } from '@app/models';
import * as fromShared from '@app/state';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { DisbursementDetailsModalComponent } from '@app/modules/disbursements/disbursement-details-modal/disbursement-details-modal.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Project } from '../../../../models/projects/project';
import * as projectActions from '../../state/actions';
import * as projectSelectors from '../../state/selectors';
import { PaymentRequestsListButtonsRendererComponent } from '../payment-requests-list-buttons-renderer/payment-requests-list-buttons-renderer.component';

@Component({
  selector: 'app-payment-requests-list',
  templateUrl: './payment-requests-list.component.html',
  styleUrls: ['./payment-requests-list.component.scss'],
})
export class PaymentRequestsListComponent extends ListView implements OnInit, OnDestroy {
  @Input() public project: Project;

  public readonly gridId: GridId = GridId.ProjectDisbursementPaymentRequestsList;
  @Output() readonly newRequestOpened = new EventEmitter();

  public rowData = [];
  public bsModalRef: BsModalRef;
  public paymentRequestStatusDropdownValues: IdValue[] = [];
  private readonly paymentRequestStatusDropdownValues$ = this.store.select<IdValue[]>(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.PaymentRequest }));
  public actionBar$ = this.store.select(projectSelectors.actionBar);
  public actionBar = {
    new: {
      callback: () => this.addNew(),
      permissions: PermissionService.create(PermissionTypeEnum.ManualPaymentRequest, PermissionActionTypeEnum.Create),
      disabled: (): boolean => !this.canAddNew,
    },
    clearFilter: this.clearFilterAction(),
  };
  private canAddNew: boolean = false;
  public ledgerSettings$ = this.store.select(projectSelectors.ledgerSettings);

  protected ngUnsubscribe$ = new Subject<void>();
  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Requestor',
        field: 'requesterName',
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
      },
      {
        headerName: 'Amount',
        field: 'paymentAmount',
        sortable: true,
        valueGetter: params => this.currencyPipe.transform((params.data as PaymentRequestSummary).paymentAmount),
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
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
      AGGridHelper.getActionsColumn({ viewHandler: this.onView.bind(this) }),
      // AGGridHelper.getActionsColumn({ viewHandler: this.viewPaymentRequest.bind(this) }), // removed until the requirements are clarified
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    // onRowDoubleClicked: this.onRowDoubleClicked.bind(this), // removed until the requirements are clarified
    components: {
      buttonRenderer: PaymentRequestsListButtonsRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
    },
  };

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    public modalService: ModalService,
    protected elementRef : ElementRef,
    private readonly currencyPipe: ExtendedCurrencyPipe,
    private readonly datePipe: DateFormatPipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.PaymentRequest }));
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBar }));
    this.store.dispatch(projectActions.GetLedgerSettings({ projectId: this.project.id }));

    this.actionBar$.pipe(first())
      .subscribe(
        actionBar => {
          this.store.dispatch(projectActions.UpdateActionBar({ ...actionBar, actionBar: this.actionBar }));
        },
      );

    this.paymentRequestStatusDropdownValues$.pipe(
      filter(item => item && item.length && !this.paymentRequestStatusDropdownValues.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.paymentRequestStatusDropdownValues.push(...dropdownValues);
    });

    this.ledgerSettings$.pipe(
      filter(p => p != null),
      takeUntil(this.ngUnsubscribe$)
    ).subscribe(
      action => {
        this.canAddNew = action.isManualPaymentRequestsAllowed;
      },
    );
  }

  public addNew(): void {
    this.newRequestOpened.emit();
  }

  public onView(data): void {
    this.showPaymentDetailsModal(data.paymentRequestId, data.isManual);
  }

  private showPaymentDetailsModal(paymentRequestId: number, isManual: boolean) {
    this.bsModalRef = this.modalService.show(DisbursementDetailsModalComponent, {
      initialState: { paymentRequestId, isManual },
      class: 'disbursement-details-modal',
    });
  }

  protected onRowDoubleClicked(row): void {
    this.onView(row.data.archerId);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    this.store.dispatch(projectActions.GetManualPaymentRequestsList({ caseId: this.project.id, agGridParams }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
