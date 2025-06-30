import { GetAllPersonContactsSuccess } from '@app/modules/dashboard/persons/contacts/state/actions';
import { Component, OnInit } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';

import { TabItem } from '@app/models';
import { PermissionService } from '@app/services';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum, ProductCategory } from '@app/models/enums';
import { ActivatedRoute } from '@angular/router';
import { DeleteAddressSuccess } from '@app/modules/addresses/add-address-modal/state/actions';
import { GetAddressesListComplete } from '@app/modules/addresses/address-list/state/actions';
import { GetDocumentsListComplete } from '@app/modules/shared/state/documents-list/actions';
import { DateFormatPipe, LienStatusPipe, ProductCategoryToStringPipe } from '@app/modules/shared/_pipes';
import { ofType } from '@ngrx/effects';
import { Store, ActionsSubject } from '@ngrx/store';
import { NEW_ID } from '@app/helpers/constants';
import { Subscription } from 'rxjs';
import { CommonHelper } from '@app/helpers';
import { GetTabsCount } from '@app/modules/shared/state/tab-info/actions';
import { TabInfoState } from '../../../shared/state/tab-info/state';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { ServiceBaseSectionComponent } from './service-base-section.component';
import { ClaimantDetailsState } from '../state/reducer';
import { LoadingFinished } from '../../../../state/root.actions';
import { ClaimantSectionBase } from './claimant-section-base.component';

@Component({
  selector: 'app-claimant-product-section',
  templateUrl: './claimant-section.component.html',
  styleUrls: ['./claimant-section.component.scss'],
})
export class ClaimantProductSectionComponent extends ServiceBaseSectionComponent implements OnInit, ClaimantSectionBase {
  entityType = EntityTypeEnum.Probates;
  isClaimantInfoExpanded: boolean = true;
  isExpandable: boolean = false;
  protected readonly tabTitles = {
    [EntityTypeEnum.ClientContacts]: 'Contacts',
    [EntityTypeEnum.Documents]: 'Documents',
  };
  readonly claimantId$ = this.store.select(selectors.id);
  readonly probateDetails$ = this.store.select(selectors.probateDetailsItem);

  private readonly tabsUrl = './tabs';
  public tabs: TabItem[];
  public categoryId: number;
  private tabsCountSub: Subscription;

  constructor(
    store: Store<ClaimantDetailsState>,
    tabInfoStore: Store<TabInfoState>,
    route: ActivatedRoute,
    datePipe: DateFormatPipe,
    lienStatusPipe: LienStatusPipe,
    productCategoryPipe: ProductCategoryToStringPipe,
    private readonly actionsSubject: ActionsSubject,
  ) {
    super(store, route, datePipe, lienStatusPipe, productCategoryPipe, tabInfoStore);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.categoryId = Number(this.route.snapshot.url[0].path);
    if (this.categoryId === ProductCategory.Probate) {
      this.claimantId$.pipe(
        filter(claimantId => !CommonHelper.isNullOrUndefined(claimantId)),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(clientId => {
        this.store.dispatch(actions.GetProbateDetailsByClientId({ clientId }));
      });
      this.addProbateListeners();
    } else {
      this.setTabs(null);
    }
  }

  private setTabs(probateDetails) {
    switch (this.categoryId) {
      case ProductCategory.Probate:
        this.tabs = [
          {
            title: 'Summary',
            link: `${this.tabsUrl}/summary`
          },
          {
            title: 'Details',
            link: `${this.tabsUrl}/details`,
            permission: PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.ViewDetails),
          },
        ];

        if (probateDetails?.id && probateDetails?.id !== NEW_ID) {
          this.tabs.push(
            {
              id: EntityTypeEnum.ClientContacts,
              title: this.tabTitles[EntityTypeEnum.ClientContacts],
              link: `${this.tabsUrl}/contacts`,
              permission: PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Read),
            },
            {
              id: EntityTypeEnum.Documents,
              title: this.tabTitles[EntityTypeEnum.Documents],
              link: `${this.tabsUrl}/documents`,
              permission: PermissionService.create(PermissionTypeEnum.ClientDocuments, PermissionActionTypeEnum.Read),
            },
          );
        }

        break;

      case ProductCategory.Bankruptcy:
        this.tabs = [
          {
            title: 'Summary',
            link: `${this.tabsUrl}/summary`
          },
        ]
        break;

      case ProductCategory.Release:
        this.tabs = [
          {
            title: 'Summary',
            link: `${this.tabsUrl}/summary`
          },
        ]
        break;

      default:
        this.tabs = [];
        break;
    }

    this.tabs.push(
      { title: 'Tracking', link: `${this.tabsUrl}/tracking`, permission: this.setPermissionForTracking(this.categoryId)},
      { title: 'Source Information', link: `${this.tabsUrl}/sourceinfo`, permission: this.setPermission(this.categoryId) },
    );

    if (this.categoryId === ProductCategory.Probate) {
      this.tabs.push({ title: 'Change History', link: `${this.tabsUrl}/change-history`, permission: PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.ViewChangeHistoryTab) });
    }
  }

  private setPermissionForTracking(categoryId: number): string {
    switch (categoryId) {
      case ProductCategory.Bankruptcy:
        return PermissionService.create(PermissionTypeEnum.Bankruptcy, PermissionActionTypeEnum.ViewTracking);
      case ProductCategory.Probate:
        return PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.ViewTracking);
      case ProductCategory.Release:
        return PermissionService.create(PermissionTypeEnum.Release, PermissionActionTypeEnum.ViewTracking);
    }
    return null;
  }

  private setPermission(categoryId: number): string {
    switch (categoryId) {
      case ProductCategory.Release:
        return PermissionService.create(PermissionTypeEnum.Release, PermissionActionTypeEnum.ViewSourceInformation);
      case ProductCategory.Bankruptcy:
        return PermissionService.create(PermissionTypeEnum.Bankruptcy, PermissionActionTypeEnum.ViewSourceInformation);
      case ProductCategory.Probate:
        return PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.ViewSourceInformation);
    }
    return null;
  }

  private addProbateListeners(): void {
    this.probateDetails$.pipe(
      filter(probateDetails => !!probateDetails),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(probateDetails => {
      this.setTabs(probateDetails);
      if (probateDetails.id !== NEW_ID && !this.tabsCountSub) {
        this.tabsCountSub = this.actionsSubject.pipe(
          takeUntil(this.ngUnsubscribe$),
          ofType(
            DeleteAddressSuccess,
            GetAddressesListComplete,
            GetDocumentsListComplete,
            actions.GetProbateDetailsByClientIdSuccess,
            GetAllPersonContactsSuccess,
          ),
        ).subscribe(() => this.store.dispatch(actions.GetProbateTabsCount({ id: probateDetails.id })));
      } else if (probateDetails.id === NEW_ID) {
        this.store.dispatch(LoadingFinished({ actionName: GetTabsCount.type }));
      }
    });
  }
}
