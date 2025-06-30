/* eslint-disable import/no-unresolved */
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HangfireService, PermissionService, SavedSearchUrlService } from '@app/services';
import { Store } from '@ngrx/store';
import { filter, first, takeUntil } from 'rxjs/operators';

import { ColumnExport, IdValue, NavItem } from '@app/models';
import { EntityTypeEnum, ExportLoadingStatus, ExportName, JobNameEnum, NavMenuGroup, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

import { AGGridHelper, IconHelper, StringHelper } from '@app/helpers';
import { IExportRequest } from '@app/models/export-request';
import * as fromAuth from '@app/modules/auth/state/index';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as exportsActions from '@app/modules/shared/state/exports/actions';
import { LogService } from '@app/services/log-service';
import { SideNavBarService } from '@app/services/navigation/side-nav-bar.service';
import { PusherService } from '@app/services/pusher.service';
import * as fromRoot from '@app/state';
import { Channel } from 'pusher-js';
import { sharedActions } from 'src/app/modules/shared/state/index';
import * as actions from '../../../modules/shared/state/digital-payments/actions';
import * as selectors from '../../../modules/shared/state/exports/selectors';
import { SideNavBase } from '../side-nav-base';

@Component({
  selector: 'app-side-nav-bar',
  templateUrl: './side-nav-bar.component.html',
  styleUrls: ['./side-nav-bar.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })), transition('void <=> *', animate(200)),
    ]),
  ],
})
export class SideNavBarComponent extends SideNavBase implements OnInit, OnDestroy {
  public selectedOrganization$ = this.store.select<any>(fromAuth.authSelectors.selectedOrganization);
  public toggled$;
  public orgId: number;
  protected channel: Channel;
  public readonly actionBar$ = this.store.select(selectors.exportsSelectors.actionBar);
  private isExporting: boolean = false;

  private actionBar: ActionHandlersMap = {
    actions: {
      options: [
        {
          name: 'Export Digital Pay Roster',
          disabled: () => this.isExporting,
          callback: () => this.export(),
        },
      ],
    },
  };

  constructor(
    store: Store<fromRoot.AppState>,
    navService: SideNavBarService,
    private readonly hangfireService: HangfireService,
    savedSearchService: SavedSearchUrlService,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly logger: LogService,
  ) {
    super(store, navService, savedSearchService);
    this.toggled$ = navService.toggleChanged;
  }

  ngOnInit() {
    this.addCurrentOrgListener();

    this.addMenuItemsChangedListener();
    this.addMainMenuInjectListener();
    this.addRecentViewsListener();
    this.addPinnedPagesListener();
    this.addSavedSearchListener();
  }

  private addCurrentOrgListener() {
    this.selectedOrganization$
      .pipe(
        filter(org => org?.id !== this.orgId),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(org => {
        this.orgId = org?.id;
        const adminNavGroup: NavItem = this.navService.find(NavMenuGroup.Admin);

        if (!adminNavGroup) {
          this.navService.add(
            NavItem.create(<NavItem>{
              name: NavMenuGroup.Admin,
              items: [
                NavItem.create(<NavItem>{
                  name: 'Hangfire Dashboard',
                  icon: 'assets/images/settings.svg',
                  action: () => { this.hangfireService.gotoDashboard(); },
                  permissions: PermissionService.create(PermissionTypeEnum.HangfireDashboard, PermissionActionTypeEnum.Read),
                }),
                NavItem.create(<NavItem>{
                  name: 'Settings',
                  icon: 'assets/images/settings.svg',
                  route: `/admin/user/orgs/${org?.id}`,
                  permissions: PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read),
                }),
                NavItem.create(<NavItem>{
                  name: 'Contract Rule Templates',
                  icon: IconHelper.getIconByEntityType(EntityTypeEnum.GlobalTemplatesSearch),
                  route: '/admin/contract-rule-templates',
                  permissions: PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Read),
                }),
                NavItem.create(<NavItem>{
                  name: 'Task Templates',
                  icon: IconHelper.getIconByEntityType(EntityTypeEnum.GlobalTemplatesSearch),
                  route: '/admin/task-templates',
                  permissions: PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Read),
                }),
                NavItem.create(<NavItem>{
                  name: 'Workflow Commands',
                  icon: 'assets/svg/right-long-solid.svg',
                  route: '/admin/workflow-commands',
                  permissions: PermissionService.create(PermissionTypeEnum.WorkflowCommands, PermissionActionTypeEnum.Read),
                }),
                NavItem.create(<NavItem>{
                  name: 'Branch Digital Pay Roster',
                  icon: IconHelper.getIconByEntityType(EntityTypeEnum.GlobalTemplatesSearch),
                  isRedirectable: false,
                  withPointer: true,
                  action: this.export.bind(this),
                  permissions: PermissionService.create(PermissionTypeEnum.DigitalPayRoster, PermissionActionTypeEnum.Read),
                }),
                NavItem.create(<NavItem>{
                  name: 'Maintenance Mode',
                  icon: IconHelper.getWarningGreyIcon(),
                  route: '/admin/maintenance-mode',
                  permissions: PermissionService.create(PermissionTypeEnum.MaintenanceMode, PermissionActionTypeEnum.Read),
                }),
                // new NavItem('Help', 'assets/images/ic_help.png', null, '/nowhere'), https://jira.s3betaplatform.com/browse/AC-3958
              ],
              expanded: false,
              permissions: PermissionService.create(PermissionTypeEnum.Admin, PermissionActionTypeEnum.Read),
            }),
          );
        }
      });
  }

  private export(): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    this.actionBar$.pipe(first())
      .subscribe(() => this.store.dispatch(exportsActions.UpdateActionBar({ actionBar: this.actionBar })));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportDigitalPayRoster);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map((i: IdValue) => i.name),
      this.exportCallback.bind(this),
      () => {
        const exportRequest: IExportRequest = {
          name: ExportName[ExportName.DigitalPayRoster],
          channelName,
          columns: this.getExportColumns(),
          searchOptions: AGGridHelper.getDefaultSearchRequest(),
        };
        this.store.dispatch(actions.ExportDigitalPayRosterRequest({ exportRequest }));
      },
    );
  }

  private exportCallback(data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(sharedActions.documentsListActions.DownloadDocument({ id: data.docId }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        this.store.dispatch(exportsActions.UpdateActionBar({ actionBar: this.actionBar }));
        break;
      case ExportLoadingStatus.Error:
        this.logger.log('Error during export', data, event);
        this.store.dispatch(actions.Error({ error: data.message }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        this.store.dispatch(exportsActions.UpdateActionBar({ actionBar: this.actionBar }));
        break;
      default:
        break;
    }
  }
  private getExportColumns(): ColumnExport[] {
    const columns: ColumnExport[] = [
      { name: 'Worker\'s Id', field: 'workersId' },
      { name: 'First Name', field: 'firstName' },
      { name: 'Last Name', field: 'lastName' },
      { name: 'Phone', field: 'phone' },
      { name: 'Email', field: 'email' },
      { name: 'Group', field: 'group' },
    ];

    return columns;
  }

  public toggle(item): void {
    if ((item && item.isRedirectable)
      || !item.id
      || (item && !item.isRedirectable && item.withPointer)) {
      (<SideNavBarService> this.navService).toggle();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
