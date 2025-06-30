import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ModalService, PermissionService } from '@app/services';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { GridOptions } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AddNewAccessPolicyModalComponent } from '@app/modules/admin/user-access-policies/access-policies/add-new-access-policy-modal/add-new-access-policy-modal.component';
import { Router } from '@angular/router';
import { takeUntil, first, filter } from 'rxjs/operators';
import { actionBar } from '@app/modules/admin/user-access-policies/access-policies/state/selectors';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import { OrganizationTabHelper } from '@app/modules/admin/user-access-policies/orgs/organization-tab.helper';
import { NavigationSettings } from '../action-bar/navigation-settings';
import { GotoParentView } from '../state/common.actions';
import * as actions from '../../admin/user-access-policies/access-policies/state/actions';
import * as selectors from '../../admin/user-access-policies/access-policies/state/selectors';
import * as fromRoot from '../../../state';

@Component({
  selector: 'app-user-access-policies-index',
  templateUrl: './user-access-policies-index.component.html',
  styleUrls: ['./user-access-policies-index.component.scss'],
})
export class UserAccessPoliciesIndexComponent extends ListView implements OnInit, OnDestroy {
  private orgId: number | null;
  public title : string = 'Access Policies Search';

  public index$ = this.store.select(selectors.accessPoliciesIndex);
  public currentOrg$ = this.store.select(fromOrgs.item);
  public accessPoliciesListActionBar$ = this.store.select(actionBar);
  public ngDestroyed$ = new Subject<void>();

  public readonly gridId: GridId = GridId.AccessPolicies;

  public actionBarActionHandlers: ActionHandlersMap = {
    new: {
      callback: () => this.addNew(),
      permissions: PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.Create),
    },
    clearFilter: this.clearFilterAction(),
    back: () => this.cancel(),
  };

  public readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        comparator: AGGridHelper.toLowerComparator,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'Level',
        field: 'policyLevel.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        width: 200,
        maxWidth: 200,
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
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
        ...AGGridHelper.dateOnlyColumnFilter(),
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

  constructor(
    private store: Store<fromRoot.AppState>,
    private datePipe: DateFormatPipe,
    public modalService: ModalService,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateAccessPoliciesActionBar({ actionBar: this.actionBarActionHandlers }));

    this.accessPoliciesListActionBar$.pipe(
      first(actionsBar => actionsBar !== null),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(actionsBar => {
        this.actionBarActionHandlers = { ...this.actionBarActionHandlers, ...actionsBar };

        this.store.dispatch(actions.UpdateAccessPoliciesActionBar({
          actionBar: {
            ...actionsBar,
            ...this.actionBarActionHandlers,
          },
        }));
      });

    this.currentOrg$.pipe(
      filter(org => !!org),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(org => {
        this.title = OrganizationTabHelper.createTitle(org.name, this.title);
        this.fetchAccessPolicies(org.id);
      });
  }

  private fetchAccessPolicies(orgId: number | null): void {
    this.orgId = orgId;

    this.fetchData(this.gridParams);
  }

  protected fetchData(_: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(actions.GetAccessPolicies({ orgId: this.orgId }));
    this.store.dispatch(actions.UpdateAccessPolicyOrgId({ orgId: this.orgId }));
  }

  private onRowDoubleClicked({ data }): void {
    const navSettings = <NavigationSettings>{ backUrl: this.router.url };

    this.store.dispatch(actions.GotoAccessPolicy({ id: data.id, navSettings }));
  }

  public addNewRecord(): void {
    this.addNew();
  }

  private addNew(): void {
    const initialState = { orgId: this.orgId };
    this.modalService.show(AddNewAccessPolicyModalComponent, {
      class: 'add-access-policy-modal',
      initialState,
    });
  }

  private cancel(): void {
    this.store.dispatch(GotoParentView());
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
