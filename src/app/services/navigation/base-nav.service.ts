import { Directive, EventEmitter } from '@angular/core';
import { KeyValue } from '@angular/common';
import { Store } from '@ngrx/store';

import { NavItem } from '@app/models';
import { EntityTypeEnum, PermissionActionTypeEnum, NavMenuGroup, PermissionTypeEnum } from '@app/models/enums';
import { IconHelper } from '@app/helpers/icon-helper';
import { GridId } from '@app/models/enums/grid-id.enum';

import * as fromRoot from '@app/state';
import * as fromRootActions from '@app/state/root.actions';
import { PermissionService } from '../permissions.service';

@Directive()
export abstract class BaseNavService {
  public mainMenuInjected = new EventEmitter<boolean>();
  public itemsChanged = new EventEmitter<NavItem[]>();
  public items: NavItem[] = [];

  // cuz of sub-menu flipping. https://jira.s3betaplatform.com/browse/AC-2111
  // the menu will be redrawn one time and only after all manipulations (add & delete) with menu-items.
  private detectionChangesTimeOut = 400;

  private mainMenu = [
    NavItem.create(<NavItem>{
      name: NavMenuGroup.GlobalSearch,
      items: [
        NavItem.create(<NavItem>{
          name: 'ANDI Messaging',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.CommunicationHub),
          route: '/andi-messaging',
          permissions: [
            PermissionService.create(PermissionTypeEnum.ANDIMessaging, PermissionActionTypeEnum.Read),
          ]
        }),
        NavItem.create(<NavItem>{
          name: 'Tasks',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.CommunicationHub),
          route: '/tasks',
          action: () => this.clearGridLocalData(GridId.TaskManagement),
          permissions: [
            PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Read),
          ],
        }),
        NavItem.create(<NavItem>{
          name: 'Document Batches',
          route: '/document-batches',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.DocumentBatch),
          permissions: [
            PermissionService.create(PermissionTypeEnum.DocumentBatch, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.DocumentBatchListView),
        }),
        NavItem.create(<NavItem>{
          name: 'Defense Dashboard',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.DefenseDashboard),
          route: '/defense-dashboard',
          permissions: [
            PermissionService.create(PermissionTypeEnum.DefenseDashboard, PermissionActionTypeEnum.TalcDefenseDashboard),
          ]
        }),
        NavItem.create(<NavItem>{
          name: 'Tort Dashboard',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.TortDashboard),
          route: '/tort-dashboard',
          permissions: [
            PermissionService.create(PermissionTypeEnum.TortDashboard, PermissionActionTypeEnum.TalcDashboard),
          ]
        }),
        NavItem.create(<NavItem>{
          name: 'Claimants',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Clients),
          route: '/claimants',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalClaimantSearch, PermissionActionTypeEnum.Read),
            PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Claimants),
        }),
        NavItem.create(<NavItem>{
          name: 'Projects',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Projects),
          route: '/projects',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalProjectSearch, PermissionActionTypeEnum.Read),
            PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Projects),
        }),
        NavItem.create(<NavItem>{
          name: 'Upload W-9',
          route: '/admin/upload-w9',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.GlobalDocumentIntake),
          permissions: [
            PermissionService.create(PermissionTypeEnum.Upload_W9, PermissionActionTypeEnum.Create),
          ],
        }),
        NavItem.create(<NavItem>{
          name: 'Payments',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Payments),
          route: '/admin/payments',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalPaymentSearch, PermissionActionTypeEnum.Read),
            PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Payments),
        }),
        NavItem.create(<NavItem>{
          name: 'Settlements',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Settlements),
          route: '/settlements',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalSettlementSearch, PermissionActionTypeEnum.Read),
            PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Settlements),
        }),
        NavItem.create(<NavItem>{
          name: 'Organizations',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Organizations),
          route: '/admin/user/orgs',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalOrganizationSearch, PermissionActionTypeEnum.Read),
            PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Organizations),
        }),
        NavItem.create(<NavItem>{
          name: 'Persons',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Persons),
          route: '/dashboard/persons',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalPersonSearch, PermissionActionTypeEnum.Read),
            PermissionService.create(PermissionTypeEnum.Persons, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Persons),
        }),
        NavItem.create(<NavItem>{
          name: 'Documents',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Documents),
          route: '/dashboard/documents',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalDocumentSearch, PermissionActionTypeEnum.Read),
            PermissionService.create(PermissionTypeEnum.Documents, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Documents),
        }),
        NavItem.create(<NavItem>{
          name: 'Document Intake',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.GlobalDocumentIntake),
          route: '/dashboard/document-intake',
          permissions: [
            PermissionService.create(PermissionTypeEnum.DocumentIntake, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.DocumentIntake),
        }),
        NavItem.create(<NavItem>{
          name: 'Communications',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Communications),
          route: '/dashboard/communications',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalCommunicationSearch, PermissionActionTypeEnum.Read),
            PermissionService.create(PermissionTypeEnum.Communications, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.GlobalCommunicationSearch),
        }),
        NavItem.create(<NavItem>{
          name: 'Torts',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Matter),
          route: '/dashboard/matters',
          permissions: [
            PermissionService.create(PermissionTypeEnum.Matters, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Matters),
        }),
        NavItem.create(<NavItem>{
          name: 'Templates',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.GlobalTemplatesSearch),
          route: '/templates',
          permissions: [
            PermissionService.create(PermissionTypeEnum.Templates, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.DocumentTemplates),
        }),
        NavItem.create(<NavItem>{
          name: 'Disbursements',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Payments),
          route: '/disbursements',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalDisbursementSearch, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Disbursements),
        }),
        NavItem.create(<NavItem>{
          name: 'Payment Queue',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Payments),
          route: '/payment-queue',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.GlobalPaymentQueue),
        }),
      ],
    }),
    /*
    // Hidden for future usage

    NavItem.create(<NavItem>{
      name: NavMenuGroup.ServicesSearch,
      items: [
        new NavItem('Release', 'assets/images/Release.svg', null, '/nowhere'),
        new NavItem('Medical Liens', 'assets/images/Lien Resolution.svg', null, '/nowhere'),
        new NavItem('Bankruptcy', 'assets/images/Bankruptcy.svg', null, '/nowhere'),
        new NavItem('Probate', 'assets/images/Probate.svg', null, '/nowhere'),
      ],
    }),
    */
    NavItem.create(<NavItem>{
      name: NavMenuGroup.Accounting,
      items: [
        NavItem.create(<NavItem>{
          name: 'Fees',
          route: '/invoice-items',
          permissions: [
            PermissionService.create(PermissionTypeEnum.AccountingDetails, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.AccountingInvoiceItems),
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.Payments),
        }),
      ],
      expanded: false,
    }),
    NavItem.create(<NavItem>{
      name: NavMenuGroup.Probates,
      items: [
        NavItem.create(<NavItem>{
          name: 'Probate Claims',
          route: '/probates',
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalProbateSearch, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.Probates),
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.GlobalProbateSearch),
        }),
      ],
      expanded: false,
    }),
    NavItem.create(<NavItem>{
      name: NavMenuGroup.DataProcessing,
      items: [
        NavItem.create(<NavItem>{
          name: 'Auditor',
          route: '/auditor',
          icon: IconHelper.getIconByEntityType(EntityTypeEnum.AuditBatches),
          permissions: [
            PermissionService.create(PermissionTypeEnum.DataProcessingAuditor, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.AuditBatches),
        }),
        NavItem.create(<NavItem>{
          name: 'Lien Finalization',
          route: '/lien-finalization',
          icon: IconHelper.getLienFinalizationIcon(),
          permissions: [
            PermissionService.create(PermissionTypeEnum.LienFinalizationTool, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.LienFinalization),
        }),
        NavItem.create(<NavItem>{
          name: 'Lien Deficiencies',
          route: '/lien-deficiencies',
          icon: IconHelper.getLienDeficienciesIcon(),
          permissions: [
            PermissionService.create(PermissionTypeEnum.Integrations, PermissionActionTypeEnum.Read),
          ],
          action: () => this.clearGridLocalData(GridId.LienDeficiencies),
        }),
      ],
      expanded: false,
    }),
    NavItem.create(<NavItem>{ name: NavMenuGroup.RecentViews, dummyItemName: `No ${NavMenuGroup.RecentViews}`, expanded: false }),
    NavItem.create(<NavItem>{ name: NavMenuGroup.SavedSearch, dummyItemName: `No ${NavMenuGroup.SavedSearch}`, expanded: false, maxItemsCount: 6 }),
    NavItem.create(<NavItem>{ name: NavMenuGroup.PinnedPages, dummyItemName: `No ${NavMenuGroup.PinnedPages}`, expanded: false }),
  ];

  constructor(private readonly store: Store<fromRoot.AppState>) {
    this.injectMainMenu();
  }

  public addByIndex(items: NavItem | NavItem[], index: number): void {
    const itemsToAdd = Array.isArray(items)
      ? items
      : [items];

    this.items.splice(index, 0, ...itemsToAdd);

    this.emitChanges();
  }

  public add(
    items: NavItem | NavItem[],
    parentId?: string,
    beforeAll: boolean = false,
  ): void {
    const itemsToAdd = Array.isArray(items)
      ? items
      : [items];

    if (parentId) {
      this.setValue(itemsToAdd, { key: 'parentId', value: parentId });
    }

    const parentMenu = parentId
      ? this.find(parentId).items
      : this.items;

    if (beforeAll) {
      parentMenu.unshift(...itemsToAdd);
    } else {
      parentMenu.push(...itemsToAdd);
    }

    this.emitChanges();
  }

  public remove(ids: string | string[]): void {
    const idList = Array.isArray(ids)
      ? ids
      : [ids];

    idList.forEach((id: string) => {
      const item = this.find(id);

      if (item.parentId) {
        const parent = this.findItem(item.parentId, this.items);
        this.removeItem(item.id, parent.items);
      } else {
        this.removeItem(item.id, this.items);
      }

      this.emitChanges();
    });
  }

  public removeChildren(parentId: string): void {
    const parent = this.find(parentId);

    while (parent.items.length) {
      this.removeItem(parent.items[0].id, parent.items);
    }
  }

  public removeAll(): void {
    this.items.length = 0;

    this.emitChanges();
  }

  public find(name: string): NavItem {
    return this.findItem(name, this.items);
  }

  public injectMainMenu(): void {
    this.add(this.mainMenu);
    this.mainMenuInjected.emit(true);
  }

  public ejectMainMenu(): void {
    for (const item of this.mainMenu) {
      this.removeItem(item.id, this.items);
    }

    this.emitChanges();
    this.mainMenuInjected.emit(false);
  }

  public expandAll(): void {
    this.setValue(this.items, { key: 'expanded', value: true });
  }

  private setValue(items: NavItem[], field: KeyValue<string, any>): void {
    for (const item of items) {
      item[field.key] = field.value;

      if (item.items.length > 0) this.setValue(item.items, field);
    }
  }

  private removeItem(id: string, items: NavItem[]): void {
    const index = items.findIndex((i: NavItem) => i.id === id);

    if (index > -1) {
      items.splice(index, 1);
    } else throw Error('Cannot find menu element');
  }

  private findItem(search: string, navItems: NavItem[]): NavItem {
    for (const item of navItems) {
      if (!item) break;

      if (item.id === search || item.name === search) return item;

      if (item.items.length > 0) {
        const targetItem = this.findItem(search, item.items);

        if (targetItem) {
          return targetItem;
        }
      }
    }
    return null;
  }

  public updateSideNavMenu(parentName: string, itemName: string, field: KeyValue<string, any>): void {
    const parent = this.find(parentName);
    if (parent && parent.items) {
      const item = this.findItem(itemName, parent.items);
      item[field.key] = field.value;
      this.emitChanges();
    }
  }

  private emitChanges(): void {
    setTimeout(() => this.itemsChanged.emit(this.items), this.detectionChangesTimeOut);
  }

  private clearGridLocalData(gridId: GridId): void {
    this.store?.dispatch(fromRootActions.ClearGridLocalData({ gridId }));
  }
}
