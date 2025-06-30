import { Component, Input, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { User } from 'src/app/models/user';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ModalService } from '@app/services/modal.service';
import { GridOptions } from 'ag-grid-community';
import { DateFormatPipe } from '@app/modules/shared/_pipes';

import { Subject } from 'rxjs';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Router } from '@angular/router';
import { takeUntil, first, filter } from 'rxjs/operators';
import { PermissionActionTypeEnum, PermissionTypeEnum, DefaultGlobalSearchType } from '@app/models/enums';
import { actionBar } from '@app/modules/admin/user-access-policies/users/state/selectors';
import { PermissionService } from '@app/services';
import { ofType } from '@ngrx/effects';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import { OrganizationTabHelper } from '@app/modules/admin/user-access-policies/orgs/organization-tab.helper';
import { accessPoliciesDropdownValues } from '../../../state';
import { AddNewUserModalComponent } from '../../admin/user-access-policies/users/add-new-user-modal/add-new-user-modal.component';
import { AppState } from '../../admin/user-access-policies/state/state';
import {
  GetAllUsersActionRequest,
  GotoUserProfile,
  UpdateUsersListActionBar,
  AfterCreateNewUserRedirect,
} from '../../admin/user-access-policies/users/state/actions';

import { CreatePager } from '../state/common.actions';
import { RelatedPage } from '../grid-pager';
import { CheckboxEditorRendererComponent } from '../_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent extends ListView implements OnInit, OnDestroy {
  @Input()
  items: User[];

  @Input()
  orgId: number;

  @Input()
  useCurrentOrganizationId = true;

  public title: string = 'Users Search';
  public bsModalRef: BsModalRef;
  public gridParams;

  public accessPolicies$ = this.store.select(accessPoliciesDropdownValues);
  public usersListActionBar$ = this.store.select(actionBar);
  public currentOrg$ = this.store.select(fromOrgs.item);
  public ngDestroyed$ = new Subject<void>();

  private readonly canViewAuditInfoPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.AuditInfo, PermissionActionTypeEnum.Users));

  public readonly gridId: GridId = GridId.Users;

  public actionBarActionHandlers: ActionHandlersMap = {
    new: {
      callback: () => this.addNewUserHandler(),
      permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Create),
    },
    clearFilter: this.clearFilterAction(),
  };

  public readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Display Name',
        field: 'displayName',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'User Name',
        field: 'userName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Email',
        field: 'email',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.emailColumnDefaultParams,
      },
      {
        headerName: 'Roles',
        field: 'roles',
        sortable: false,
        valueGetter: params => {
          const { data } = params;
          return data && data.roles && data.roles.map(x => x.name).join(', ');
        },
        resizable: true,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter({ disabled: true }),
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy',
        colId: 'lastModifiedBy.displayName',
        sortable: true,
        valueGetter: params => {
          const { data } = params;
          return data && data.lastModifiedBy && data.lastModifiedBy.displayName;
        },
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
        hide: !this.canViewAuditInfoPermission,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        suppressSizeToFit: true,
        resizable: true,
        width: 180,
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        hide: !this.canViewAuditInfoPermission,
      },
      {
        headerName: 'Active',
        field: 'isActive',
        sortable: true,
        cellRenderer: 'checkboxRenderer',
        suppressSizeToFit: true,
        resizable: true,
        width: 90,
        ...AGGridHelper.getYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    components: { checkboxRenderer: CheckboxEditorRendererComponent },
  };

  public readonly searchType = DefaultGlobalSearchType.Users;

  constructor(
    private store: Store<AppState>,
    private modalService: ModalService,
    private datePipe: DateFormatPipe,
    protected router: Router,
    protected elementRef : ElementRef,
    private actionsSubj: ActionsSubject,
    private readonly permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store.dispatch(UpdateUsersListActionBar({ actionBar: this.actionBarActionHandlers }));

    this.currentOrg$.pipe(
      filter(org => !!org),
      takeUntil(this.ngDestroyed$),
    ).subscribe(org => {
      this.orgId = org.id;
      this.title = OrganizationTabHelper.createTitle(org.name, this.title);
    });

    this.usersListActionBar$.pipe(
      first(actionsBar => actionsBar !== null),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(actionsBar => {
        this.actionBarActionHandlers = { ...this.actionBarActionHandlers, ...actionsBar };

        this.store.dispatch(UpdateUsersListActionBar({
          actionBar: {
            ...actionsBar,
            ...this.actionBarActionHandlers,
          },
        }));
      });
    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(AfterCreateNewUserRedirect),
    ).subscribe(() => {
      this.bsModalRef.hide();
      // this.router.navigate([`admin/user/users/${userId}`]); //TODO: [KD] fix route after the demo
    });
  }

  protected fetchData(params): void {
    this.gridParams = params;
    // eslint-disable-next-line no-param-reassign
    params.request.orgId = this.orgId;
    this.store.dispatch(GetAllUsersActionRequest({ params }));
  }

  protected onRowDoubleClicked({ data }): void {
    const navSettings = AGGridHelper.getNavSettings(this.gridApi);
    navSettings.backUrl = this.router.url;

    this.store.dispatch(CreatePager({ relatedPage: RelatedPage.UsersFromSearch, settings: navSettings }));
    this.store.dispatch(GotoUserProfile({ userId: data.id, navSettings }));
  }

  public addNewRecord(): void {
    this.addNewUserHandler();
  }

  private addNewUserHandler(): void {
    const initialState = {
      title: 'Create User',
      orgId: this.orgId,
      onSaveFinished: () => this.fetchData(this.gridParams),
    };
    this.bsModalRef = this.modalService.show(AddNewUserModalComponent, {
      initialState,
      class: 'add-user-modal',
    });
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
