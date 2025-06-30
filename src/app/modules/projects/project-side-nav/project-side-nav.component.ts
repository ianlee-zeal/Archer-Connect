import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Subject, combineLatest, of } from 'rxjs';

import { SideNavMenuService } from '@app/services/navigation/side-nav-menu.service';
import { NavItem, LienService, Project } from '@app/models';
import { UrlHelper } from '@app/helpers/url-helper';
import { LienStatusIconPipe, LienStatusPipe, LienServiceIconPipe } from '@app/modules/shared/_pipes';
import { NavItemBadge } from '@app/models/nav-item-badge';
import { EntityTypeEnum, LienServiceStatus, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { Policy } from '@app/modules/auth/policy';
import { EntityPaymentsService } from '@app/modules/payments/base';
import { IconHelper } from '@app/helpers';
import { ProjectCounts } from '@app/models/projects/project-counts';
import * as qsfSweepSelectors from '@app/modules/qsf-sweep/state/selectors';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as qsfSweepActions from '@app/modules/qsf-sweep/state/actions';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ProjectsState } from '../state/reducer';
import { PowerBiConfigService } from '@app/services/api/power-bi-config.service';
import { PowerBiProjectPermission, PowerBiProjectPermissionsResponse } from '@app/services/power-bi-config.model';

type ProjectBadgeType = { [key in keyof ProjectCounts]: ProjectCounts[key] extends number ? string : boolean } & { services: LienService[] };

@Component({
  selector: 'app-project-side-nav',
  templateUrl: './project-side-nav.component.html',
})
export class ProjectSideNavComponent implements OnInit, OnDestroy {
  private readonly navItemProject = 'Project';
  private readonly navItemDashboard = 'Dashboard';
  private readonly navItemOverview = 'Overview';
  private readonly navItemClaimants = 'Claimants';
  private readonly navItemServices = 'Services';
  private readonly navItemSettings = 'Settings';
  private readonly navItemContacts = 'Contacts';
  private readonly navItemOrganizations = 'Organizations';
  private readonly navItemDeficiencies = 'QSF Deficiencies';
  private readonly navItemPortalDeficiencies = 'Deficiencies';

  private localMenu: NavItem[] = [];
  private baseUrl: string;

  private readonly ngUnsubscribe$ = new Subject<void>();
  private readonly item$ = this.store.select(selectors.item);
  private readonly projectCounts$ = this.store.select(selectors.projectCounts);
  private readonly services$ = this.store.select(selectors.services);

  private powerBiProjectPermissions: PowerBiProjectPermission[];

  public actionBar$ = this.store.select(selectors.actionBar);
  public isQsfSweepInProgress$ = this.store.select(qsfSweepSelectors.isQsfSweepInProgress);
  public currentCaseId: number;
  public isQsfSweepInProgress = false;
  public actionBar: ActionHandlersMap;


  constructor(
    private readonly store: Store<ProjectsState>,
    readonly router: Router,
    private readonly sideNavMenuService: SideNavMenuService,
    private readonly lienStatusPipe: LienStatusPipe,
    private readonly lienStatusIconPipe: LienStatusIconPipe,
    private readonly lienServiceIconPipe: LienServiceIconPipe,
    private readonly entityPaymentsService: EntityPaymentsService,
    public route: ActivatedRoute,
    protected readonly permissionService: PermissionService,
    private readonly powerBiConfigService: PowerBiConfigService,
  ) {
  }

  ngOnInit(): void {
    this.currentCaseId = this.route.snapshot.params.id;
    this.powerBiConfigService.getPermissionActionTypes().subscribe( (response: PowerBiProjectPermissionsResponse) => {
      this.powerBiProjectPermissions = response.powerBiProjectPermissions;
      this.addProjectListener();
      this.initQsfSweepSubscriptions();
    })
  }

  private addProjectListener(): void {
    combineLatest([this.services$, this.projectCounts$])
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        switchMap(([services, projectCounts]: [LienService[], ProjectCounts]) => {
          const clientCount = projectCounts?.clientCount?.toString() || '';
          const deficienciesCount = projectCounts?.deficienciesCount?.toString() || '';
          const hasErrorDeficiency = projectCounts?.hasErrorDeficiency || false;
          const isNetPaidInFull = projectCounts?.isNetPaidInFull || false;
          const portalDeficienciesCount = projectCounts?.portalDeficienciesCount || '';

          return of({ clientCount, deficienciesCount, hasErrorDeficiency, isNetPaidInFull, services, portalDeficienciesCount });
        }),
        tap((data: ProjectBadgeType) => {
          if (data.services) {
            this.addProjectMenu(data.clientCount, data.deficienciesCount, data.hasErrorDeficiency, data.portalDeficienciesCount);
            this.addServicesMenu(data.services, data.clientCount, data.isNetPaidInFull);
            this.addAccountingMenu();
          } else {
            // This is for async updating of the badges of the left menu items
            // we don't wait until the projectCounts request is executed to render the left menu items
            this.sideNavMenuService.updateSideNavMenu('Project', 'QSF Deficiencies', { key: 'badges', value: this.getDeficiencyBadges(data.deficienciesCount, data.hasErrorDeficiency) });
            this.sideNavMenuService.updateSideNavMenu('Project', 'Claimants', { key: 'badges', value: [new NavItemBadge(null, data.clientCount, this.navItemClaimants)] });
          }
        }),

      ).subscribe();

    this.item$
      .pipe(
        filter((item: Project) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((projectItem: Project) => {
        this.baseUrl = UrlHelper.getBaseUrl(window.location.pathname);
        this.store.dispatch(actions.GetProjectServices({ projectId: projectItem.id }));
      });
  }

  private addProjectMenu(claimantBadgeText: string, deficiencyBadgeText: string, deficiencyHasErrors: boolean, portalDeficienciesBadgeText: string): void {
    this.sideNavMenuService.removeAll();
    this.sideNavMenuService.expandMenu();

    this.localMenu = [
      new NavItem(this.navItemProject, null, null, null, [
        NavItem.create(<NavItem>{
          name: this.navItemDashboard,
          icon: 'assets/svg/address-card.svg',
          route: `${this.baseUrl}/dashboard`,
          permissions: PermissionService.create(PermissionTypeEnum.ProjectDashboard, PermissionActionTypeEnum.Read),
        }),
        new NavItem(this.navItemOverview, 'assets/images/Project.svg', null, `${this.baseUrl}/overview`),
        NavItem.create(<NavItem>{
          name: this.navItemPortalDeficiencies,
          icon: 'assets/images/project-deficiencies.svg',
          route: `${this.baseUrl}/portal-deficiencies`,
          badges: this.getPortalDeficienciesBadge(portalDeficienciesBadgeText),
          permissions: PermissionService.create(PermissionTypeEnum.ProjectDeficiencies, PermissionActionTypeEnum.Read),
        }),
        NavItem.create(<NavItem>{
          name: this.navItemDeficiencies,
          icon: 'assets/images/project-deficiencies.svg',
          route: `${this.baseUrl}/deficiencies`,
          badges: this.getDeficiencyBadges(deficiencyBadgeText, deficiencyHasErrors),
          permissions: PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read),
        }),
        NavItem.create(<NavItem>{
          name: this.navItemClaimants,
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Clients),
          route: `${this.baseUrl}/claimants`,
          badges: [new NavItemBadge(null, claimantBadgeText, this.navItemClaimants)],
          permissions: PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.Read),
        }),
        NavItem.create(<NavItem>{
          name: this.navItemOrganizations,
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Organizations),
          route: `${this.baseUrl}/organizations`,
          permissions: PermissionService.create(PermissionTypeEnum.ProjectOrganizations, PermissionActionTypeEnum.Read),
        }),
        NavItem.create(<NavItem>{
          name: this.navItemSettings,
          icon: 'assets/images/settings.svg',
          route: `${this.baseUrl}/settings`,
          permissions: PermissionService.create(PermissionTypeEnum.ProjectSettings, PermissionActionTypeEnum.Read),
        }),
        NavItem.create(<NavItem>{
          name: this.navItemContacts,
          icon: 'assets/images/contacts.svg',
          route: `${this.baseUrl}/contacts`,
          permissions: PermissionService.create(PermissionTypeEnum.ProjectContacts, PermissionActionTypeEnum.Read),
        }),
      ]),
    ];

    this.sideNavMenuService.add(this.localMenu, null, true);
  }

  private addServicesMenu(services: LienService[], claimantCount: string, isNetPaidInFull: boolean): void {
    let servicesMenuItems: NavItem[] = [];

    services.forEach((service: LienService) => {
      if(Policy.getLienServices(service.id, true) == PermissionTypeEnum.Claims && Policy.getLienServiceActions(service.id, this.powerBiProjectPermissions, this.currentCaseId) == null) {
        ;
      }
      else {
        let navItem: NavItem = NavItem.create(<NavItem>{
          name: service.name,
          icon: this.lienServiceIconPipe.transform(service.id),
          route: `${this.baseUrl}/services/${service.id}`,
          badges: this.getBadges(service),
          permissions: PermissionService.create(Policy.getLienServices(service.id, true), Policy.getLienServiceActions(service.id, this.powerBiProjectPermissions, this.currentCaseId)),
        });
        servicesMenuItems.push(navItem);
      }
    });

    this.entityPaymentsService.addDisbursementsNavigationItem(this.baseUrl, servicesMenuItems, this.getDisbursmentBadges(claimantCount, isNetPaidInFull));
    this.removeMenuGroupIfExists(this.navItemServices);
    this.sideNavMenuService.add(NavItem.create(<NavItem>{ name: this.navItemServices, items: servicesMenuItems }));
  }

  private addAccountingMenu(): void {
    const accountingSideNavName = 'Accounting';
    this.removeMenuGroupIfExists(accountingSideNavName);
    this.sideNavMenuService.add(
      NavItem.create(<NavItem>{
        name: accountingSideNavName,
        items: [
          NavItem.create(<NavItem>{
            name: 'Fees',
            route: `${this.baseUrl}/accounting-details`,
            permissions: PermissionService.create(PermissionTypeEnum.AccountingDetails, PermissionActionTypeEnum.Read),
            icon: IconHelper.getIconByEntityType(EntityTypeEnum.Payments),
          }),
          NavItem.create(<NavItem>{
            name: 'Contract Rules',
            route: `${this.baseUrl}/settings/tabs/contract-rules`,
            permissions: PermissionService.create(PermissionTypeEnum.ProjectSettings, PermissionActionTypeEnum.Read),
            icon: IconHelper.getIconByEntityType(EntityTypeEnum.Documents),
          }),
        ],
      }),
    );
  }

  private removeMenuGroupIfExists(name: string): void {
    if (this.sideNavMenuService.find(name)) {
      this.sideNavMenuService.remove(name);
    }
  }

  private getDeficiencyBadges(deficiencyCount: string, hasErrors: boolean): NavItemBadge[] {
    const badges = [new NavItemBadge(null, deficiencyCount, 'QSF Deficiencies')];
    if (hasErrors === true) { badges.push(new NavItemBadge(null, '', 'Error', 'fas fa-exclamation-triangle text-danger')); }
    return badges;
  }

  private getPortalDeficienciesBadge(portalDeficienciesCount: string): NavItemBadge[] {
    return [new NavItemBadge(null, portalDeficienciesCount, 'Deficiencies')];
  }

  private getDisbursmentBadges(claimantCount: string, isNetPaidInFull: boolean): NavItemBadge[] {
    const status = isNetPaidInFull ? LienServiceStatus.Finalized : LienServiceStatus.Pending;
    return [
      new NavItemBadge(null, claimantCount.toString(), 'Claimants'),
      new NavItemBadge(
        this.lienStatusIconPipe.transform(status),
        null,
        this.getStatusTooltip(status),
      ),
    ];
  }

  private getBadges(lienService: LienService): NavItemBadge[] {
    return [
      new NavItemBadge(null, lienService.count.toString(), 'Claimants'),
      new NavItemBadge(
        this.lienStatusIconPipe.transform(lienService.status.id),
        null,
        this.getStatusTooltip(lienService.status.id),
      ),
    ];
  }

  private getStatusTooltip(status: LienServiceStatus): string {
    if (status === LienServiceStatus.NotEngaged) {
      return null;
    }

    return this.lienStatusPipe.transform(status);
  }

  private initQsfSweepSubscriptions(): void {
    if (!this.permissionService.has(PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.RunQSFSweep))) {
      return;
    }

    this.actionBar$.pipe(
      filter((actionBar: ActionHandlersMap) => !!actionBar && actionBar !== this.actionBar),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((actionBar: ActionHandlersMap) => {
      this.actionBar = actionBar;
      if (!!actionBar && !actionBar.qsfSweepInProgress) {
        this.store.dispatch(actions.UpdateActionBar({ actionBar: { ...this.actionBar, qsfSweepInProgress: { hidden: () => !this.isQsfSweepInProgress } } }));
      }
    });

    this.isQsfSweepInProgress$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => {
      this.isQsfSweepInProgress = result;
      this.store.dispatch(actions.UpdateActionBar({ actionBar: { ...this.actionBar, qsfSweepInProgress: { hidden: () => !this.isQsfSweepInProgress } } }));
    });
  }

  private resetQsfSweep(): void {
    this.isQsfSweepInProgress = false;
    this.store.dispatch(qsfSweepActions.SetQsfSweepStatus({ isQsfSweepInProgress: false }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    this.sideNavMenuService.removeAll();
    this.sideNavMenuService.injectMainMenu();
    this.resetQsfSweep();
  }
}
