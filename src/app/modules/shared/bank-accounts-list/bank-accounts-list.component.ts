import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, first, filter } from 'rxjs/operators';
import { GridOptions } from 'ag-grid-community';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { SetDefaultBankAccount } from '@app/modules/admin/user-access-policies/orgs/state/actions';
import { OrganizationTabHelper } from '@app/modules/admin/user-access-policies/orgs/organization-tab.helper';
import { ClearGridLocalData } from '@app/state/root.actions';
import * as bankAccountAction from '@app/modules/admin/bank-accounts/state/actions';
import * as fromAuth from '@app/modules/auth/state';
import { GetBankAccounts, UpdateBankAccountsActionBar } from '../../admin/bank-accounts/state/actions';
import { actionBar } from '../../admin/bank-accounts/state/selectors';
import { BankAccountsButtonsRendererComponent } from '../../admin/bank-accounts/renderers/bank-accounts-buttons-renderer';
import { AGGridHelper } from '../../../helpers/ag-grid.helper';
import { NavigationSettings } from '../action-bar/navigation-settings';
import { GridCheckmarkRendererComponent } from '../grid-checkmark-renderer/grid-checkmark-renderer.component';
import { PrimaryTagRendererComponent } from '../_renderers/primary-tag-renderer/primary-tag-renderer.component';
import { CheckboxEditorRendererComponent } from '../_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';

@Component({
  selector: 'app-bank-accounts-list',
  templateUrl: './bank-accounts-list.component.html',
  styleUrls: ['./bank-accounts-list.component.scss'],
})
export class BankAccountsListComponent extends ListView implements OnInit, OnDestroy {
  private orgId: number;
  public readonly gridId: GridId = GridId.BankAccounts;
  public title: string;
  private timezone: string;

  public selectedOrg$ = this.store.select(fromOrgs.item);
  public bankListActionBar$ = this.store.select(actionBar);
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);

  public actionBarActionHandlers: ActionHandlersMap = {
    back: () => OrganizationTabHelper.handleBackClick(this.store),
    new: {
      callback: () => this.addNewBankAccountHandler(),
      permissions: PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Create),
    },
    clearFilter: this.clearFilterAction(),
  };

  public ngDestroyed$ = new Subject<void>();

  public readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Default',
        field: 'isPrimary',
        sortable: true,
        sort: 'desc',
        width: 90,
        minWidth: 90,
        maxWidth: 90,
        cellRenderer: 'primaryRenderer',
        resizable: false,
        suppressSizeToFit: true,
        pinned: 'left',
        lockPinned: true,
        ...AGGridHelper.getCustomTextColumnFilter({ disabled: true }),
      },
      {
        headerName: 'Active',
        headerTooltip: 'Status',
        field: 'statusActive',
        colId: 'active',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'Connect Account Name',
        field: 'name',
        sortable: true,
        minWidth: 170,
        width: 170,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'Bank’s Account Name',
        field: 'bankAccountName',
        sortable: true,
        minWidth: 170,
        width: 170,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Bank Name',
        field: 'bankName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Account Number',
        field: 'hiddenAccountNumber',
        colId: 'accountNumberDecrypted',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Account Type',
        field: 'bankAccountType.name',
        width: 130,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'status.name',
        width: 130,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        onCellDoubleClicked: this.onRowDoubleClicked.bind(this),
        cellRenderer: data => this.datePipe.transform(data.value, false, null, this.timezone),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, this.timezone),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      AGGridHelper.getActionsColumn({
        editBankAccountHandler: this.editClickHandler.bind(this),
        setPrimaryBankAccountHandler: this.onSetPrimaryBankAccountHandler.bind(this),
      }),
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: BankAccountsButtonsRendererComponent,
      checkMarkRenderer: GridCheckmarkRendererComponent,
      primaryRenderer: PrimaryTagRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    private store: Store<any>,
    protected router: Router,
    protected elementRef: ElementRef,
    private datePipe: DateFormatPipe,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.authStore$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.timezone = user.timezone && user.timezone.name;
    });

    this.selectedOrg$.pipe(
      filter(org => !!org),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(org => {
        this.setHeaderTitle(org.name);
      });

    this.store.dispatch(UpdateBankAccountsActionBar({ actionBar: this.actionBarActionHandlers }));

    this.bankListActionBar$.pipe(
      first(actionsBar => actionsBar !== null),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(actionsBar => {
        this.actionBarActionHandlers = { ...this.actionBarActionHandlers, ...actionsBar };

        this.store.dispatch(UpdateBankAccountsActionBar({
          actionBar: {
            ...actionsBar,
            ...this.actionBarActionHandlers,
          },
        }));
      });
  }

  protected fetchData(params): void {
    this.selectedOrg$.pipe(
      filter(org => !!org),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(org => {
        this.title = OrganizationTabHelper.createTitle(org.name, 'Bank Accounts');
        this.orgId = org.id;
        params.request.orgId = org.id;
        this.store.dispatch(GetBankAccounts({ params }));
      });
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (row) {
      this.goToBankAccount(row.id, false);
    }
  }

  private onSetPrimaryBankAccountHandler(e): void {
    this.store.dispatch(SetDefaultBankAccount({ orgId: this.orgId, bankAccountId: e.node.data.id }));
  }

  public addNewBankAccountHandler(): void {
    this.router.navigate(['admin', 'user', 'orgs', this.orgId, 'payment-instructions', 'new']);
  }

  public goToBankAccount(id: number, canEdit: boolean): void {
    const navSettings = <NavigationSettings>{ backUrl: this.router.url };

    this.router.navigate(['admin', 'user', 'orgs', this.orgId, 'payment-instructions', id], { state: { navSettings, canEdit } });
  }

  private editClickHandler({ data }) {
    this.goToBankAccount(data.id, true);
  }

  private setHeaderTitle(orgName: string) {
    const headerTitle = OrganizationTabHelper.createTitle(orgName, 'Payment Instructions');
    this.store.dispatch(bankAccountAction.UpdateHeaderTitle({ headerTitle }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(ClearGridLocalData({ gridId: this.gridId }));
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
    super.ngOnDestroy();
  }
}
