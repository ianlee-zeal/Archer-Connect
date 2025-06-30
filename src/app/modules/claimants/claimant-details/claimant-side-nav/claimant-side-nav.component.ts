import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';

import { SideNavMenuService } from '@app/services/navigation/side-nav-menu.service';
import { NavItem, ProjectClaimantRequest } from '@app/models';
import { UrlHelper } from '@app/helpers/url-helper';
import { EntityTypeEnum, LienServiceStatus, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { NavItemBadge } from '@app/models/nav-item-badge';
import { IconHelper } from '@app/helpers/icon-helper';
import { LienStatusIconPipe, LienStatusPipe, LienServiceIconPipe } from '@shared/_pipes';
import { LienService } from '@app/models/lien-service';
import { PermissionService } from '@app/services';
import { Policy } from '@app/modules/auth/policy';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import * as fromShared from '@shared/state/common.actions';
import { EntityPaymentsService } from '@app/modules/payments/base';
import { ClaimantCounts } from '@app/models/claimant-counts';
import { ClaimantDetailsState } from '../state/reducer';

import * as actions from '../state/actions';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-claimant-side-nav',
  templateUrl: './claimant-side-nav.component.html',
})
export class ClaimantSideNavComponent implements OnInit, OnDestroy {
  public readonly id$ = this.store.select(selectors.id);
  public readonly claimant$ = this.store.select(selectors.item);

  private readonly projects$ = this.store.select(selectors.projects);
  private readonly services$ = this.store.select(selectors.services);
  private readonly claimantCounts$ = this.store.select(selectors.claimantCounts);
  private readonly ngUnsubscribe$ = new Subject<void>();

  private baseUrl: string;
  private claimantId: number;

  private hasProjectsReadPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.Read));

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly sideNavMenuService: SideNavMenuService,
    private readonly lienStatusPipe: LienStatusPipe,
    private readonly lienStatusIconPipe: LienStatusIconPipe,
    private readonly lienServiceIconPipe: LienServiceIconPipe,
    private readonly permissionService: PermissionService,
    private readonly entityPaymentsService: EntityPaymentsService,
  ) {
  }

  ngOnInit(): void {
    this.baseUrl = UrlHelper.getBaseUrl(window.location.pathname);
    this.sideNavMenuService.ejectMainMenu();

    this.claimantCounts$
      .pipe(
        filter((claimantCounts: ClaimantCounts) => !!claimantCounts),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((claimantCounts: ClaimantCounts) => {
        const deficiencyBadgeText = claimantCounts.deficienciesCount?.toString();
        const deficiencyHasErrors = claimantCounts.hasErrorDeficiency;
        this.addClaimantMenu(deficiencyBadgeText, deficiencyHasErrors);
      });

    this.id$
      .pipe(
        filter((id: number) => !!id),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((id: number) => {
        this.claimantId = +id;

        this.baseUrl = UrlHelper.getBaseUrl(window.location.pathname);
        this.store.dispatch(actions.GetClaimantServices({ clientId: id }));
      });

    if (this.hasProjectsReadPermission) {
      this.claimant$
        .pipe(
          filter((claimant: any) => !!claimant),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe((claimant: any) => {
          this.store.dispatch(actions.GetPersonProjects({ personId: claimant.personId }));
        });
    }

    if (this.hasProjectsReadPermission) {
      combineLatest([this.projects$, this.services$, this.claimantCounts$])
        .pipe(
          filter(([projects, services, _claimantCounts]: [ProjectClaimantRequest[], LienService[], ClaimantCounts]) => !!projects && !!services && !!_claimantCounts),
          takeUntil(this.ngUnsubscribe$),
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .subscribe(([projects, services, _claimantCounts]: [ProjectClaimantRequest[], LienService[], ClaimantCounts]) => {
          this.addServicesMenu(services);
          this.addAccountingMenu();
          this.addProbatesMenu();
          this.addOtherProjectsMenu(projects);
        });
    } else {
      combineLatest([this.services$, this.claimantCounts$])
        .pipe(
          filter(([services, _claimantCounts]: [LienService[], ClaimantCounts]) => !!services && !!_claimantCounts),
          takeUntil(this.ngUnsubscribe$),
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .subscribe(([services, _claimantCounts]: [LienService[], ClaimantCounts]) => {
          this.addServicesMenu(services);
          this.addAccountingMenu();
          this.addProbatesMenu();
        });
    }
  }

  private addClaimantMenu(deficiencyCount: string, hasErrors: boolean): void {
    this.sideNavMenuService.removeAll();
    this.sideNavMenuService.expandMenu();

    const claimantMenu = NavItem.create(<NavItem>{
      name: 'Claimant',
      items: [
        NavItem.create(<NavItem>{
          name: 'Dashboard',
          icon: 'assets/svg/address-card.svg',
          route: `${this.baseUrl}/dashboard`,
          action: this.activateDefaultPager.bind(this),
          permissions: PermissionService.create(PermissionTypeEnum.ClaimantDashboard, PermissionActionTypeEnum.Read),
        }),
        NavItem.create(<NavItem>{
          name: 'Overview',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Clients),
          route: `${this.baseUrl}/overview`,
          action: this.activateDefaultPager.bind(this),
        }),
        NavItem.create(<NavItem>{
          name: 'QSF Deficiencies',
          icon: 'assets/images/project-deficiencies.svg',
          route: `${this.baseUrl}/deficiencies`,
          badges: this.getDeficiencyBadges(deficiencyCount, hasErrors),
          permissions: PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read),
        }),
      ],
    });

    this.sideNavMenuService.add(claimantMenu);
  }

  private getDeficiencyBadges(deficiencyCount: string, hasErrors: boolean): NavItemBadge[] {
    const badges = [new NavItemBadge(null, deficiencyCount, 'Deficiencies')];
    if (hasErrors === true) { badges.push(new NavItemBadge(null, '', 'Error', 'fas fa-exclamation-triangle text-danger')); }
    return badges;
  }

  private addAccountingMenu(): void {
    const name = 'Accounting';
    const accountingMenu = [
      NavItem.create(<NavItem>{
        name,
        route: `${this.baseUrl}/accounting-details`,
        permissions: PermissionService.create(PermissionTypeEnum.AccountingDetails, PermissionActionTypeEnum.Read),
        isTopLevelItem: true,
      }),
    ];
    this.removeMenuGroupIfExists(name);
    this.sideNavMenuService.add(accountingMenu, null);
  }

  private addProbatesMenu(): void {
    const name = 'Probate Claims';
    const probatesMenu = [
      NavItem.create(<NavItem>{
        name,
        route: '/probates',
        permissions: PermissionService.create(PermissionTypeEnum.GlobalProbateSearch, PermissionActionTypeEnum.Read),
        isTopLevelItem: true,
      }),
    ];
    this.removeMenuGroupIfExists(name);
    this.sideNavMenuService.add(probatesMenu, null);
  }

  private addServicesMenu(services: LienService[]): void {
    const servicesMenuItems = services.map((service: LienService) => NavItem.create(<NavItem>{
      name: service.name,
      icon: this.lienServiceIconPipe.transform(service.id),
      route: `${this.baseUrl}/services/${service.id}`,
      badges: this.getBadges(service),
      action: this.activateServicesFromClaimantOverviewPager.bind(this),
      permissions: PermissionService.create(Policy.getLienServices(service.id), PermissionActionTypeEnum.Read),
    }));

    this.entityPaymentsService.addDisbursementsNavigationItem(this.baseUrl, servicesMenuItems);

    const servicesSideNavName = 'Services';
    this.removeMenuGroupIfExists(servicesSideNavName);
    this.sideNavMenuService.add(NavItem.create(<NavItem>{ name: servicesSideNavName, items: servicesMenuItems }));
  }

  private activateServicesFromClaimantOverviewPager(): void {
    const payload = {
      entityId: this.claimantId,
    };

    this.store.dispatch(fromShared.CreatePager({
      relatedPage: RelatedPage.ServicesFromClaimantOverview,
      settings: { current: 0, count: 1, backUrl: null },
      pager: { payload },
    }));
  }

  // Show other projects only for multiple projects in the claimant (via person ref)
  private addOtherProjectsMenu(projects: ProjectClaimantRequest[]): void {
    const otherServicesSideNavName = 'Other Projects';
    this.removeMenuGroupIfExists(otherServicesSideNavName);
    if (projects.length < 2) {
      return;
    }

    const projectsMenuItems: NavItem[] = [];

    for (const projectInfo of projects) {
      if (this.claimantId === projectInfo.claimantId) {
        continue;
      }

      projectsMenuItems.push(NavItem.create(<NavItem>{
        name: projectInfo.projectName,
        icon: IconHelper.getIconByEntityType(EntityTypeEnum.Projects),
        route: `/claimants/${projectInfo.claimantId}`,
        action: this.setOtherProjectItemActive.bind(this, projectInfo.claimantId),
      }));
    }

    this.sideNavMenuService.add(NavItem.create(<NavItem>{
      name: otherServicesSideNavName,
      items: projectsMenuItems,
    }));
  }

  private setOtherProjectItemActive(claimantId): void {
    this.store.dispatch(actions.GetClaimantRequest({ id: claimantId }));
    this.store.dispatch(actions.GetClaimantIdSummaryRequest({ id: claimantId }));
    this.store.dispatch(fromShared.ActivatePager({ relatedPage: RelatedPage.ProjectsOther }));
  }

  private activateDefaultPager(): void {
    this.store.dispatch(fromShared.ActivatePager({ relatedPage: RelatedPage.ClaimantsFromSearch }));
  }

  private getBadges(lienService: LienService): NavItemBadge[] {
    return [
      new NavItemBadge(null, lienService.count.toString(), 'Products'),
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

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    this.sideNavMenuService.removeAll();
    this.sideNavMenuService.injectMainMenu();
  }

  private removeMenuGroupIfExists(name: string): void {
    if (this.sideNavMenuService.find(name)) {
      this.sideNavMenuService.remove(name);
    }
  }
}
