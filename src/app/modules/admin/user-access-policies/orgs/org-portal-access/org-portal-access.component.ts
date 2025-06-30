import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CaseType, EntityStatus } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DecimalPipe } from '@angular/common';
import { AppState } from '../state';
import * as actions from '../state/actions';
import { OrganizationTabHelper } from '../organization-tab.helper';
import { UrlHelper } from '@app/helpers/url-helper';
import { GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';


@Component({
  selector: 'app-org-portal-access',
  templateUrl: './org-portal-access.component.html',
})
export class OrgPortalAccessComponent extends ListView implements OnInit {
  public readonly gridId = GridId.PortalAccessProjects;

  public gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 50,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Settlement',
        field: 'settlementName',
        colId: 'settlement.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Tort',
        field: 'matter',
        colId: 'tort',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Type',
        field: 'projectType.name',
        colId: 'caseTypeId',
        cellRenderer: 'valueWithTooltip',
        minWidth: 100,
        width: 100,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: CaseType.MassTort,
              name: 'Mass Tort',
            },
            {
              id: CaseType.SingleEvent,
              name: 'Single Event',
            },
            {
              id: CaseType.ClassAction,
              name: 'Class Action',
            },
          ],
        }),
      },
      {
        headerName: 'Managed in AC',
        field: 'isManagedInAC',
        colId: 'isManagedInAC',
        minWidth: 100,
        width: 100,
        sortable: true,
        resizable: true,
        cellRenderer: data => (data.value ? 'Yes' : 'No'),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'Primary Firm',
        field: 'organization.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Active Claimants',
        field: 'activeCount',
        width: 150,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        valueFormatter: data => this.decimalPipe.transform(data.value),
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Inactive Claimants',
        field: 'inactiveCount',
        width: 150,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        valueFormatter: data => this.decimalPipe.transform(data.value),
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Status',
        field: 'status.name',
        colId: 'status.id',
        sortable: true,
        minWidth: 100,
        width: 100,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: EntityStatus.LeadCase,
              name: 'Lead',
            },
            {
              id: EntityStatus.ActiveCase,
              name: 'Active',
            },
            {
              id: EntityStatus.InactiveCase,
              name: 'Inactive',
            },
            {
              id: EntityStatus.CompleteCase,
              name: 'Complete',
            },
          ],
        }),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
  };

  constructor(
    private store: Store<AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    protected readonly decimalPipe: DecimalPipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateOrgsActionBar({ actionBar: {
      back: () => OrganizationTabHelper.handleBackClick(this.store),
      clearFilter: this.clearFilterAction(),
    } }));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    const orgId = UrlHelper.getId(this.router.url, 4);
    this.store.dispatch(actions.GetProjectGridDataRequest({ orgId: orgId, gridParams: params }));
  }

}