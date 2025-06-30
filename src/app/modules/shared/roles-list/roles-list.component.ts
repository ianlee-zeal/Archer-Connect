import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ModalService } from '@app/services/modal.service';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Router } from '@angular/router';
import { takeUntil, first, filter } from 'rxjs/operators';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import { OrganizationTabHelper } from '@app/modules/admin/user-access-policies/orgs/organization-tab.helper';
import { RolesAddNewModalComponent } from '../../admin/user-access-policies/roles/roles-add-new-modal/roles-add-new-modal.component';
import { actions } from '../../admin/user-access-policies/roles/state';
import { OrganizationRoleState } from '../../admin/user-access-policies/roles/state/reducers';
import { actionBar } from '../../admin/user-access-policies/roles/state/selectors';
import { CreatePager, GotoParentView } from '../state/common.actions';
import { RelatedPage } from '../grid-pager';
import  * as selectors  from '../../admin/user-access-policies/roles/state/selectors';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'],
})
export class RolesListComponent extends ListView implements OnInit, OnDestroy {
  private orgId: number;
  public title: string = 'Roles Search';
  public bsModalRef: BsModalRef;
  public selectedRoleIds: number[] = [];

  public rolesListActionBar$ = this.store.select(actionBar);
  public selectedOrg$ = this.store.select(fromOrgs.item);
  public orgId$ = this.store.select(fromOrgs.orgId);
  public ngDestroyed$ = new Subject<void>();
  public orgRoles$ = this.store.select(selectors.orgRoles);

  public readonly gridId: GridId = GridId.Roles;

  public readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Role Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'Level',
        field: 'roleLevel.name',
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Access Policy',
        field: 'accessPolicy.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
        valueGetter: params => params.data.accessPolicy?.nameWithPolicyLevel,
      },
      {
        headerName: 'User Count',
        field: 'usersCount',
        colId: 'organizationRoleUser.count',
        sortable: true,
        width: 100,
        ...AGGridHelper.fixedColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
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
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public actionBarActionHandlers: ActionHandlersMap = {
    back: () => this.store.dispatch(GotoParentView('admin/user/orgs')),
    new: {
      callback: () => this.onCreate(),
      permissions: PermissionService.create(PermissionTypeEnum.Roles, PermissionActionTypeEnum.Create),
    },
    clearFilter: this.clearFilterAction(),
  };

  constructor(
    private store: Store<OrganizationRoleState>,
    private modalService: ModalService,
    private datePipe: DateFormatPipe,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.store.dispatch(actions.UpdateOrgRoleActionBar({ actionBar: this.actionBarActionHandlers }));

    this.selectedOrg$.pipe(
      filter(org => !!org),
      takeUntil(this.ngDestroyed$),
    ).subscribe(org => {
      this.title = OrganizationTabHelper.createTitle(org.name, this.title);
    });

    this.orgId$.pipe(
      filter(org => !!org),
      takeUntil(this.ngDestroyed$),
    ).subscribe(id => {
      this.orgId = id;
    });

    this.rolesListActionBar$.pipe(
      first(actionsBar => actionsBar !== null),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(actionsBar => {
        this.actionBarActionHandlers = { ...this.actionBarActionHandlers, ...actionsBar };

        this.store.dispatch(actions.UpdateOrgRoleActionBar({
          actionBar: {
            ...actionsBar,
            ...this.actionBarActionHandlers,
          },
        }));
      });

    this.fetchData(this.gridParams);
  }

  protected fetchData(params: any): void {
    // eslint-disable-next-line no-param-reassign
    params = {
      request: {
        orgId: this.orgId,
        endRow: -1,
      }
    };
    this.store.dispatch(actions.GetOrganizationRolesRequest({ agGridParams:params }));
  }

  protected onRowDoubleClicked({ data: row }): void {
    const navSettings = AGGridHelper.getNavSettings(this.gridApi);
    this.store.dispatch(CreatePager({ relatedPage: RelatedPage.RolesFromSearch, settings: navSettings }));
    this.store.dispatch(actions.GoToOrgRole({ id: row.id, navSettings }));
  }

  public addNewRecord(): void {
    this.onCreate();
  }

  private onCreate(): void {
    this.bsModalRef = this.modalService.show(RolesAddNewModalComponent, {
      class: 'add-org-role-modal',
      initialState: { orgId: this.orgId },
    });
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
