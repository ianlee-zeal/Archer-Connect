import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DecimalPipe } from '@angular/common';
import { PermissionService } from '@app/services';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { IdValue } from '@app/models';
import { filter, takeUntil } from 'rxjs/operators';
import { BrtServicesCellRendererComponent } from '@app/modules/shared/outcome-based-pricing-list/renderers/services-cell-renderer/services-cell-renderer.component';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { BrtActionPanelCellRendererComponent } from '../renderers/action-panel-cell-renderer/action-panel-cell-renderer.component';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';


@Component({
  selector: 'app-billing-rule-templates-list',
  templateUrl: './billing-rule-templates-list.component.html',
})
export class BillingRuleTemplatesListComponent extends ListView {
  public readonly gridId = GridId.BillingRuleTemplates;

  public actionBarActionHandlers: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    new: {
      callback: () => this.openEditBillingRuleTemplate(true),
      permissions: PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Create),
    },
  };

  private statuses: IdValue[] = [];
  private accountCodes: SelectOption[] = [];

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 50,
        maxWidth: 100,
        sortable: true,
        sort: 'desc',
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Description',
        field: 'description',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'status.name',
        colId: 'statusId',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.statuses }),
      },
      {
        headerName: 'Invoicing Item',
        field: 'invoicingItem.name',
        colId: 'invoicingItemName',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Rev Rec Item',
        field: 'revRecItem.name',
        colId: 'revRecItemName',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Rev Rec Method',
        field: 'revRecMethod.name',
        colId: 'revRecMethodName',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Related Services',
        field: 'relatedServices',
        colId: 'serviceName',
        sortable: true,
        cellRenderer: 'servicesRenderer',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 210,
        width: 210,
      },
      {
        headerName: 'Contract Rules',
        field: 'referenceCount',
        width: 120,
        maxWidth: 120,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        valueFormatter: data => this.decimalPipe.transform(data.value),
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'QSF GL Code Account',
        field: 'chartOfAccount.name',
        colId: 'chartOfAccountName',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.accountCodes }, 'agTextColumnFilter'),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        colId: 'createdBy',
        sortable: true,
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        resizable: true,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        colId: 'lastModifiedBy',
        sortable: true,
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        resizable: true,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      AGGridHelper.getActionsColumn({ editHandler: this.onEditHandler.bind(this) }, 80, true),
    ],
    components: {
      buttonRenderer: BrtActionPanelCellRendererComponent,
      servicesRenderer: BrtServicesCellRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  private statuses$ = this.store.select(selectors.statuses);
  private chartOfAccounts$ = this.store.select(selectors.chartOfAccounts);

  constructor(
    router: Router,
    elementRef: ElementRef,
    private readonly store: Store<AppState>,
    private readonly decimalPipe: DecimalPipe,
    private readonly permissionService: PermissionService,
    private readonly datePipe: DateFormatPipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.statuses$.pipe(
      filter(s => s && !this.statuses.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(statuses => {
      this.statuses.push(...statuses);
    });
    this.chartOfAccounts$.pipe(
      filter(s => s && s.length && !this.accountCodes.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      const selectOpts = opts.map((o: IdValue) => ({ id: o.name, name: o.name }));
      this.accountCodes.push(...selectOpts);
    });
    this.store.dispatch(actions.GetChartOfAccounts());
    this.store.dispatch(actions.GetBillingRuleTemplateStatuses());
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.store.dispatch(actions.SearchBillingRuleTemplates({ gridParams: this.gridParams }));
  }

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  private onEditHandler(data): void {
    this.onRowDoubleClicked(data, true);
  }

  protected onRowDoubleClicked(param: any, canEdit: boolean = false): void {
    if (this.permissionService.canEdit(PermissionTypeEnum.BillingRuleTemplate)) {
      const billingRuleTemplate: BillingRuleTemplate = param.data;
      this.openEditBillingRuleTemplate(canEdit, billingRuleTemplate.id);
    }
  }

  private openEditBillingRuleTemplate(canEdit: boolean, brtId?: number): void {
    this.router.navigate(['admin', 'contract-rule-templates', brtId || 'new'], { state: { canEdit, brtId } });
  }
}
