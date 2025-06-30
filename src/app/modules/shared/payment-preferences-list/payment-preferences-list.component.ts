import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { PaymentPreferenceModalComponent } from '@app/modules/admin/bank-accounts/payment-preference-modal/payment-preference-modal.component';
import * as bankAccountAction from '@app/modules/admin/bank-accounts/state/actions';
import { UpdateBankAccountsActionBar } from '@app/modules/admin/bank-accounts/state/actions';
import { OrganizationTabHelper } from '@app/modules/admin/user-access-policies/orgs/organization-tab.helper';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ModalService, PermissionService } from '@app/services';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import * as orgActions from '../../admin/user-access-policies/orgs/state/actions';

import { LevelEnum } from '@app/models/enums/level.enum';
import { CheckboxEditorRendererComponent } from '../_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { GotoParentView } from '../state/common.actions';
import { PaymentPreferencesListActionsRendererComponent } from './payment-preferences-list-actions-renderer/payment-preferences-list-actions-renderer.component';

@Component({
  selector: 'app-payment-preferences-list',
  templateUrl: './payment-preferences-list.component.html',
  styleUrls: ['./payment-preferences-list.component.scss'],
})
export class PaymentPreferencesListComponent extends ListView implements OnInit, OnDestroy {
  public orgId: number;
  public gridId: GridId = GridId.PaymentPreferences;
  public selectedOrg$ = this.store.select(fromOrgs.item);
  public ngDestroyed$ = new Subject<void>();

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Active',
        headerTooltip: 'Status',
        field: 'status',
        colId: 'active',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'Level',
        headerTooltip: 'Level',
        field: 'level',
        colId: 'isGlobal',
        maxWidth: 150,
        sortable: true,
        sort: 'desc',
        cellRenderer: param => (param.data.isGlobal ? 'Global Default' : param.data.level),
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: LevelEnum.Global,
              name: 'Global',
            },
            {
              id: LevelEnum.Project,
              name: 'Project',
            },
            {
              id: LevelEnum.Claimant,
              name: 'Claimant',
            },
          ],
        }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Applied Payment Type',
        headerTooltip: 'Applied Payment Type',
        field: 'paymentType',
        colId: 'paymentItemType.name',
        maxWidth: 150,
        sortable: true,
        cellRenderer: param => (param.value ? param.value : 'Default'),
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Project Name',
        headerTooltip: 'Project Name',
        field: 'case.name',
        colId: 'case.name',
        maxWidth: 150,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Payment Method',
        headerTooltip: 'Payment Method',
        field: 'paymentMethod',
        colId: 'paymentMethod.name',
        maxWidth: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Address',
        headerTooltip: 'Address',
        field: 'address.lineOne',
        maxWidth: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Bank Account Name',
        headerTooltip: 'Bank Account Name',
        field: 'bankAccountName',
        colId: 'bankAccount.name',
        sortable: true,
        minWidth: 170,
        width: 170,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Bank Name',
        headerTooltip: 'Bank Name',
        field: 'bankName',
        colId: 'bankAccount.bankName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Account Number',
        headerTooltip: 'Account Number',
        field: 'accountNumber',
        colId: 'bankAccount.accountNumberDecrypted',
        maxWidth: 120,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Further Credit Account',
        headerTooltip: 'Further Credit Account',
        field: 'furtherCreditAccount',
        colId: 'furtherCreditAccount',
        maxWidth: 150,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Account Type',
        headerTooltip: 'Account Type',
        field: 'accountType',
        colId: 'bankAccount.bankAccountType.name',
        maxWidth: 120,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Bank Account Status',
        headerTooltip: 'Bank Account Status',
        field: 'bankAccountStatus',
        colId: 'bankAccount.status.name',
        maxWidth: 150,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Last Modified By',
        headerTooltip: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        headerTooltip: 'Last Modified Date',
        field: 'lastModifiedDate',
        cellRenderer: data => (data ? this.datePipe.transform(data.value) : null),
        sortable: true,
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      AGGridHelper.getActionsColumn({ editPaymentPreferencesHandler: this.editClickHandler.bind(this) }),
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: PaymentPreferencesListActionsRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
    },
    onRowDoubleClicked: this.editClickHandler.bind(this),
  };

  constructor(
    private readonly datePipe: DateFormatPipe,
    private store: Store<any>,
    protected router: Router,
    elementRef : ElementRef,
    private modalService: ModalService,
    private permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  ngOnInit() {
    this.store.dispatch(UpdateBankAccountsActionBar({
      actionBar: {
        back: () => this.cancel(),
        new: {
          callback: () => this.showPaymentPreferenceModal(),
          permissions: PermissionService.create(PermissionTypeEnum.OrganizationPaymentInstruction, PermissionActionTypeEnum.Create),
        },
        clearFilter: this.clearFilterAction(),
      },
    }));

    this.selectedOrg$.pipe(
      filter(org => !!org),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(org => {
        this.orgId = org.id;

        this.store.dispatch(orgActions.GetProjectsRequest({ orgId: this.orgId }));
        this.store.dispatch(orgActions.GetBankAccountsList({ orgId: this.orgId }));
        this.store.dispatch(orgActions.GetDefaultPaymentAddress({ orgId: this.orgId, entityType: EntityTypeEnum.Organizations }));

        this.setHeaderTitle(org.name);
      });
  }

  protected fetchData(params): void {
    this.gridParams = params;

    this.selectedOrg$.pipe(
      filter(org => !!org),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(org => {
        this.orgId = org.id;
        this.searchByLevelRequest();
        this.store.dispatch(orgActions.GetPaymentPreferencesList({ orgId: this.orgId, gridParams: this.gridParams }));
      });
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  private editClickHandler({ data }) {
    if (this.permissionService.canCreate(PermissionTypeEnum.OrganizationPaymentInstruction)) {
      this.showPaymentPreferenceModal(data);
    }
  }

  private showPaymentPreferenceModal(paymentPreferencesItem?: any): void {
    this.modalService.show(PaymentPreferenceModalComponent, {
      class: 'payment-preference-modal',
      initialState: { orgId: this.orgId, paymentPreferencesItem, title: 'Manage Payment Instructions' },
    });
  }

  private cancel(): void {
    this.store.dispatch(GotoParentView('admin/user/orgs'));
  }

  private setHeaderTitle(orgName: string) {
    const headerTitle = OrganizationTabHelper.createTitle(orgName, 'Payment Instructions / Payment Instructions');
    this.store.dispatch(bankAccountAction.UpdateHeaderTitle({ headerTitle }));
  }

  private searchByLevelRequest(): void {
    this.gridParams.request.filterModel.forEach(filterModel => {
      if (filterModel.key === 'isGlobal') {
        filterModel.filterType = 'text';
        if (filterModel.filter === LevelEnum.Global) {
          filterModel.filter = 'true';
        }
        if(filterModel.filter === LevelEnum.Project) {
          filterModel.filter = 'false';
          this.gridParams.request.filterModel.push({
            filterType: 'exists',
            key: 'clientId',
            type: 'notEqual',
            filter: null,
            filterTo: null,
            operation: null,
            conditions: [],
            dateFrom: null,
            dateTo: null
          });
        }
        if(filterModel.filter === LevelEnum.Claimant) {
          filterModel.filterType = 'number';
          filterModel.key = 'clientId';
          filterModel.type = 'greaterThan';
          filterModel.filter = 0;
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
    super.ngOnDestroy();
  }
}
