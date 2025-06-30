import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { GridOptions } from 'ag-grid-community';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ModalService } from '@app/services';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as authActions from '@app/modules/auth/state/auth.actions';
import { DefaultGlobalSearchType } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import { filter, first, takeUntil } from 'rxjs/operators';
import { OrgsButtonsRendererComponent } from '../renderers/orgs-buttons-renderer';
import * as userAccessPolicyActions from '../state/actions';
import { GetSubOrgListRequest } from '../state/org-sub-organization/actions';
import { OrganizationTabHelper } from '../organization-tab.helper';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-sub-organization',
  templateUrl: './sub-organization.component.html',
})
export class SubOrganizationComponent extends ListView implements OnInit {
  public title: string = 'Sub Organizations';

  public selectedOrg$ = this.store.select(fromOrgs.item);

  public readonly gridId: GridId = GridId.SubOrganizations;

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'Alt Name',
        field: 'altName',
        colId: 'alternativeName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Type',
        field: 'primaryOrgTypeName',
        colId: 'primaryOrgType.name',
        sortable: true,
        width: 180,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Tax ID',
        field: 'taxId',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Address',
        field: 'primaryAddress.lineOne',
        ...AGGridHelper.getCustomTextColumnFilter(),
        sortable: true,
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'City',
        field: 'primaryAddress.city',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.cityColumnDefaultParams,
      },
      {
        headerName: 'State',
        field: 'primaryAddress.state',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.stateColumnDefaultParams,
      },
      {
        headerName: 'Zip Code',
        field: 'primaryAddress.zipCode',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.zipColumnDefaultParams,
      },
      {
        headerName: 'Primary Phone',
        field: 'primaryPhone.number',
        ...AGGridHelper.getCustomTextColumnFilter(),
        sortable: true,
        ...AGGridHelper.phoneColumnDefaultParams,
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
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      AGGridHelper.getActionsColumn({
        editSubOrgHandler: this.onEditSubOrgHandler.bind(this),
        switchOrgHandler: this.onSwitchOrgHandler.bind(this),
      }),
    ],
    components: { buttonRenderer: OrgsButtonsRendererComponent },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public readonly searchType = DefaultGlobalSearchType.Organizations;

  constructor(
    private store: Store<any>,
    public modalService: ModalService,
    private datePipe: DateFormatPipe,
    private route: ActivatedRoute,
    protected router: Router,
    protected elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.selectedOrg$.pipe(
      filter(org => !!org),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(org => {
      this.title = OrganizationTabHelper.createTitle(org.name, this.title);
    });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.selectedOrg$.pipe(
      filter(org => !!org),
      first(),
    ).subscribe(org => {
      this.store.dispatch(GetSubOrgListRequest({ orgId: org.id, params }));
    });
  }

  public actionBarActionHandlers: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    back: () => OrganizationTabHelper.handleBackClick(this.store),
  };

  protected onRowDoubleClicked({ data }): void {
    this.gotoSubOrganization(data.id, false);
  }

  public onEditSubOrgHandler(e): void {
    this.gotoSubOrganization(e.data.id, true);
  }

  public onSwitchOrgHandler(e): void {
    this.store.dispatch(authActions.SelectOrganization({ id: e.data.id }));
  }

  private gotoSubOrganization(subId: number, edit: boolean) {
    this.store.dispatch(userAccessPolicyActions.GetOrg({ id: subId, isSubOrg: true }));
    this.store.dispatch(userAccessPolicyActions.GoToOrg({ id: subId, edit }));
  }
}
