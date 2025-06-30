import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ModalService, PermissionService } from '@app/services';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as authActions from '@app/modules/auth/state/auth.actions';

import { DefaultGlobalSearchType, PermissionActionTypeEnum, PermissionTypeEnum, ExportLoadingStatus, JobNameEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromRoot from '../../../../../state';
import * as userAccessPolicyActions from '../state/actions';
import { OrgsButtonsRendererComponent } from '../renderers/orgs-buttons-renderer';
import { AddNewOrgModalComponent } from '../add-new-org-modal/add-new-org-modal.component';
import { StringHelper } from '@app/helpers';
import { PusherService } from '@app/services/pusher.service';
import * as exportsActions from '@shared/state/exports/actions';
import { exportsSelectors } from '@shared/state/exports/selectors';
import { filter, first, takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { TypedAction } from '@ngrx/store/src/models';
import * as fromAuth from '@app/modules/auth/state';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { GenerateUserLoginReportModalComponent } from './generate-user-login-report-modal/generate-user-login-report-modal.component';
import * as orgSelectors from '../state/selectors';
import { UserLoginReportRequest } from '@app/models/users-audit/user-login-report-request';

@Component({
  selector: 'app-org-list',
  templateUrl: './org-list.component.html',
})
export class OrgListComponent extends ListView implements OnInit {
  public readonly gridId: GridId = GridId.Organizations;
  protected isExporting = false;
  private canSeeMasterActions = false;
  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);
  private readonly canViewPortalAccessColumnPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.GlobalOrganizationSearch, PermissionActionTypeEnum.ViewPortalAccessColumn));
  public actionBar$ = this.store.select(orgSelectors.orgTypesSelectors.actionBar);

  private userLoginReportDocGenerator: SaveDocumentGeneratorRequest;

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
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Portal Access',
        field: 'portalAccess',
        sortable: true,
        cellRenderer: data => (data.value ? 'Yes' : 'No'),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        hide: !this.canViewPortalAccessColumnPermission,
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
        headerName: 'Legal Name',
        field: 'legalName',
        colId: 'legalName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Name on Check',
        field: 'nameOnCheck',
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
        width: 150,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Address',
        field: 'primaryAddress.lineOne',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
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
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.phoneColumnDefaultParams,
      },
      {
        headerName: 'Client Relationship Specialist',
        field: 'clientRelationshipSpecialist.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Account Manager',
        field: 'accountManager.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
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
        editOrgHandler: this.onEditOrgHandler.bind(this),
        editSubOrgHandler: this.onEditSubOrgHandler.bind(this),
        switchOrgHandler: this.onSwitchOrgHandler.bind(this),
      }),
      {
        headerName: 'Status',
        field: 'active',
        sortable: true,
        cellRenderer: data => (data.value ? 'Active' : 'Inactive'),
        ...AGGridHelper.getActiveInactiveFilter(),
      },
    ],
    components: { buttonRenderer: OrgsButtonsRendererComponent },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public readonly searchType = DefaultGlobalSearchType.Organizations;
  constructor(
    private store: Store<fromRoot.AppState>,
    public modalService: ModalService,
    private datePipe: DateFormatPipe,
    protected router: Router,
    protected elementRef: ElementRef,
    private readonly pusher: PusherService,
    private actionsSubj: ActionsSubject,
    private readonly permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.actionBar$
      .pipe(first())
      .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(userAccessPolicyActions.UpdateOrgsListActionBar({ actionBar: this.getActionBar(actionBar) })));

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(userAccessPolicyActions.DownloadOrgsComplete),
    )
    .subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
      this.store.dispatch(userAccessPolicyActions.UpdateOrgsListActionBar({ actionBar: this.getActionBar(null) }));
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(userAccessPolicyActions.GenerateUserLoginReportComplete),
    ).subscribe((action: { generationRequest: SaveDocumentGeneratorRequest; } & TypedAction<string>) => {
      this.userLoginReportDocGenerator = action.generationRequest;
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
      this.store.dispatch(userAccessPolicyActions.UpdateOrgsListActionBar({ actionBar: this.getActionBar(null) }));
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(userAccessPolicyActions.DownloadUsersComplete, userAccessPolicyActions.DownloadUsersError)
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
      this.store.dispatch(userAccessPolicyActions.UpdateOrgsListActionBar({ actionBar: this.getActionBar(null) }));
    });

    this.user$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.canSeeMasterActions = user.defaultOrganization?.isMaster;
    });
  }

  protected fetchData(params): void {
    this.gridParams = params;
    this.store.dispatch(userAccessPolicyActions.GetOrgsGrid({ params }));
  }

  private getActionBar(actionBar: ActionHandlersMap): ActionHandlersMap {
    return {
      ...actionBar,
      new: {
        callback: () => this.addNew(),
        permissions: PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Create),
      },
      download: {
        disabled: () => this.isExporting,
        hidden: () => !this.canSeeMasterActions ,
        options: [
          { name: 'Organization', permissions: PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read), callback: () => this.exportOrganizationsList() },
          { name: 'Users', permissions: PermissionService.create(PermissionTypeEnum.GlobalOrganizationSearch, PermissionActionTypeEnum.ExportUsers), callback: () => this.exportUsersList() },
          { name: 'User Login Report', permissions: PermissionService.create(PermissionTypeEnum.GlobalOrganizationSearch, PermissionActionTypeEnum.ExportUserLoginReport), callback: () => this.exportUserLoginReport() },
        ],
      },
      clearFilter: this.clearFilterAction(),
      exporting: { hidden: () => !this.isExporting },
    };
  }

  protected onRowDoubleClicked({ data }): void {
    this.store.dispatch(userAccessPolicyActions.GoToOrg({ id: data.id, edit: false }));
  }

  public addNewRecord(): void {
    this.addNew();
  }

  private addNew(): void {
    this.modalService.show(AddNewOrgModalComponent, { class: 'add-new-org-modal' });
  }

  public onEditOrgHandler(e): void {
    this.store.dispatch(userAccessPolicyActions.GoToOrg({ id: e.data.id, edit: true }));
  }

  public onSwitchOrgHandler(e): void {
    this.store.dispatch(authActions.SelectOrganization({ id: e.data.id }));
  }

  public onEditSubOrgHandler(e): void {
    this.store.dispatch(userAccessPolicyActions.GetOrg({ id: e.data.id, isSubOrg: true }));
    this.store.dispatch(userAccessPolicyActions.GoToOrg({ id: e.data.id, edit: true }));
  }

  private exportOrganizationsList(): void {
    const params = this.getExportParams();
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportOrganizations);

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
      this.exportOrgsListCallback.bind(this),
      () => {
        this.store.dispatch(userAccessPolicyActions.DownloadOrgs({
          agGridParams: params,
          channelName,
        }));

        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.store.dispatch(userAccessPolicyActions.UpdateOrgsListActionBar({ actionBar: this.getActionBar(null) }));
      },
    );
  }

  private exportOrgsListCallback(data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(userAccessPolicyActions.DownloadOrgsDocument({ id: data.docId }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(userAccessPolicyActions.Error({ error: { message: `Error exporting: ${data.message}` } }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      default:
        break;
    }
  }

  private exportUsersList(): void {
    this.store.dispatch(userAccessPolicyActions.DownloadUsers());
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    this.store.dispatch(userAccessPolicyActions.UpdateUsersListActionBar({ actionBar: this.getActionBar(null) }));
  }

  private exportUsersListCallback(_data, _event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.store.dispatch(userAccessPolicyActions.UpdateUsersListActionBar({ actionBar: this.getActionBar(null) }));
  }

  private exportUserLoginReport(): void {
    const initialState = {
      title: 'User Login Report Generation',
      generateHandler: (dateFrom: Date, dateTo: Date) => {
        const channelName = this.generateChannelName(JobNameEnum.ExportUserLoginReport);

        const request: UserLoginReportRequest = {
          channelName,
          dateFrom: new Date(Date.UTC(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())),
          dateTo: new Date(Date.UTC(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate()))
        }

        this.channel = this.pusher.subscribeChannel(
          channelName,
          Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
          this.exportUserLoginReportCallback.bind(this),
          () => {
            this.store.dispatch(userAccessPolicyActions.GenerateUserLoginReport({ request}))

            this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
            this.store.dispatch(userAccessPolicyActions.UpdateOrgsListActionBar({ actionBar: this.getActionBar(null) }));
          },
        );
      },
    }

    this.modalService.show(GenerateUserLoginReportModalComponent, { initialState });

  }

  private exportUserLoginReportCallback (data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(userAccessPolicyActions.DownloadGeneratedDocument({ generatorId: this.userLoginReportDocGenerator.id }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(userAccessPolicyActions.Error({ error: { message: `Error exporting: ${data.message}` } }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      default:
        break;
    }
  }
  private generateChannelName(jobName: JobNameEnum) {
    const channelName = StringHelper.generateChannelName(jobName);

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
    return channelName;
  }
}
