import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, zip } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import {
  EntityTypeEnum,
  PermissionActionTypeEnum,
  PermissionTypeEnum,
  ProductCategory,
  ProjectScopeStatusEnum,
} from '@app/models/enums';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as rootActions from '@app/state/root.actions';
import { ModalService, PermissionService } from '@app/services';
import * as commonActions from 'src/app/modules/projects/state/actions';
import { ProjectProductCategory } from '@app/models/scope-of-work';
import { archerId } from '@app/modules/claimants/claimant-details/state/selectors';
import { GetArcherOrgId } from '@app/modules/claimants/claimant-details/state/actions';
import * as rootSelectors from '@app/state/index';
import { IdValue } from '@app/models/idValue';
import * as fromProjects from '../state';

import * as actions from './state/actions';
import { scopeOfWorkSelectors as selectors } from './state/selectors';
import { CopySettingsModalComponent } from './modals/copy-settings-modal/copy-settings-modal.component';

@Component({
  selector: 'app-project-scope-of-work',
  templateUrl: './project-scope-of-work.component.html',
  styleUrls: ['./project-scope-of-work.component.scss'],
})
export class ProjectScopeOfWorkComponent implements OnInit, OnDestroy {
  public readEngagedServicesPermission = PermissionService.create(
    PermissionTypeEnum.EngagedServices,
    PermissionActionTypeEnum.Read,
  );

  public readonly allProducts$ = this.store.select(selectors.allProducts);
  public archerId$ = this.store.select(archerId);
  public statusOptions$ = this.store.select<IdValue[]>(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.ScopeOfWork }));
  public readonly allProductConditions$ = this.store.select(
    selectors.allProductConditions,
  );
  public readonly productCategories$ = this.store.select(
    selectors.productCategories,
  );

  public readonly productCategoryEnum = ProductCategory;
  public projectScopeStatus = ProjectScopeStatusEnum;
  public canViewEngagedServices: boolean;
  public productCategories: ProjectProductCategory[];

  private expandedGroups = new Set<number>();

  public get hasProductCategories(): boolean {
    return !!this.productCategories?.length;
  }

  private changedProductCategories: ProjectProductCategory[] = [];

  private projectId: number = 0;
  public ngDestroyed$ = new Subject<void>();

  private readonly actionBar: ActionHandlersMap = {
    save: {
      callback: () => this.save(),
      disabled: () => !this.canSave || !this.hasChanges,
      hidden: () => !this.canEdit,
      permissions: PermissionService.create(
        PermissionTypeEnum.EngagedServices,
        PermissionActionTypeEnum.Edit,
      ),
    },
    cancel: {
      callback: () => this.cancel(),
      hidden: () => !this.canEdit,
    },
    edit: {
      callback: () => this.edit(),
      hidden: () => this.canEdit,
      permissions: PermissionService.create(
        PermissionTypeEnum.EngagedServices,
        PermissionActionTypeEnum.Edit,
      ),
    },
    collapseAll: {
      callback: () => this.toggleAllGroups(false),
      hidden: () => !this.hasProductCategories
        || this.expandedGroups?.size !== this.getYesProductCategories().length,
    },
    expandAll: {
      callback: () => this.toggleAllGroups(true),
      hidden: () => !this.hasProductCategories
        || this.expandedGroups.size === this.getYesProductCategories().length,
    },
    actions: {
      permissions: PermissionService.create(
        PermissionTypeEnum.Projects,
        PermissionActionTypeEnum.CopyProjectSettings,
      ),
      options: [
        {
          name: 'Copy Settings',
          callback: () => this.copySettings(),
          permissions: PermissionService.create(
            PermissionTypeEnum.Projects,
            PermissionActionTypeEnum.CopyProjectSettings,
          ),
        },
      ],
    },
  };

  public canEdit = false;
  public canSave = true;
  public hasChanges: boolean = false;

  protected save() {
    let productCategories = this.getModifiedCategories();

    // don't pass child product categories when their parent has no 'Yes' status
    productCategories = productCategories.filter(category => {
      const parentId = category.productCategory.parentId;
      if (!parentId) {
        return true;
      }

      const parent = productCategories.find(
        pc => pc.productCategoryId === parentId,
      );
      return !parent || this.hasYesStatus(parent);
    });

    productCategories.forEach(category => {
      if (category.productCategory.parentId) {
        category.statusId = this.projectScopeStatus.Yes;
      }
    });

    this.store.dispatch(
      actions.UpdateProductCategories({
        projectId: this.projectId,
        productCategories,
        callback: () => this.store.dispatch(actions.UpdateProductCategoriesSuccess()),
      }),
    );
  }

  constructor(
    private readonly store: Store<fromProjects.AppState>,
    private route: ActivatedRoute,
    private readonly permissionService: PermissionService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    if (this.permissionService.has(this.readEngagedServicesPermission)) {
      this.canViewEngagedServices = true;
      this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.ScopeOfWork }));
      this.store.dispatch(GetArcherOrgId());
      this.route.parent.parent.parent.params
        .pipe(takeUntil(this.ngDestroyed$))
        .subscribe(params => {
          this.projectId = params.id;
          this.store.dispatch(actions.GetAllProductsAndConditions());

          zip(this.allProducts$, this.allProductConditions$)
            .pipe(
              filter(
                ([allProducts, allConditions]) => allProducts?.length && !!allConditions,
              ),
              takeUntil(this.ngDestroyed$),
            )
            .subscribe(([]) => {
              this.store.dispatch(
                actions.GetProductCategories({
                  projectId: this.projectId,
                  callback: () => {},
                }),
              );
              this.subscribeToProductCategories();
            });
        });

      this.store.dispatch(
        commonActions.UpdateActionBar({ actionBar: this.actionBar }),
      );
    } else {
      this.canViewEngagedServices = false;
    }
  }

  public onProductCategoryChanged(event) {
    const { productCategory, isValidData } = event;

    this.syncProductCategories(productCategory);

    // Update changed collection
    const productCategoryIdx = this.changedProductCategories.findIndex(
      i => i.productCategoryId === productCategory.productCategoryId,
    );

    productCategoryIdx >= 0
      ? (this.changedProductCategories[productCategoryIdx] = productCategory)
      : this.changedProductCategories.push(productCategory);

    this.canSave = isValidData;
    this.hasChanges = !!this.getModifiedCategories().length;
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ResetProductCategories());

    if (this.hasProductCategories) {
      this.productCategories.length = 0;
    }

    this.store.dispatch(commonActions.UpdateActionBar({ actionBar: null }));

    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }

  edit(): void {
    this.canEdit = !this.canEdit;
  }

  cancel(): void {
    this.store.dispatch(
      actions.GetProductCategories({
        projectId: this.projectId,
        callback: () => this.edit(),
      }),
    );
  }

  copySettings(): void {
    this.modalService.show(CopySettingsModalComponent, {
      initialState: {
        projectId: this.projectId,
      },
    });
  }

  private subscribeToProductCategories() {
    this.productCategories$
      .pipe(
        filter(items => !!items && items.length > 0),
        takeUntil(this.ngDestroyed$),
      )
      .subscribe(productCategories => {
        this.productCategories = productCategories;
        this.resetChanges();
      });
  }

  private getModifiedCategories() {
    return this.changedProductCategories.filter(category => {
      let result = !category.products.length
        || !!category.products.find(
          p => p.isModified || !!p.conditions.find(c => c.isModified),
        );
      if (!result) {
        result = !category.products.find(
          p => typeof p.isModified === 'boolean',
        );
        result = result
          && !category.products.find(
            p => p.conditions.length
              && p.conditions.find(c => typeof c.isModified === 'boolean'),
          );
      }
      return result;
    }) as ProjectProductCategory[];
  }

  private syncProductCategories(
    changedProductCategory: ProjectProductCategory,
  ) {
    const productCategory = this.productCategories.find(
      g => g.productCategoryId == changedProductCategory.productCategoryId,
    );

    if (productCategory) {
      Object.assign(productCategory, changedProductCategory);
    }
  }

  private resetChanges() {
    this.productCategories.forEach(pc => {
      const groupNo = pc.productCategoryId;
      this.hasExpandedState(groupNo)
        && !this.hasYesStatus(pc)
        && this.toggleGroup(groupNo);
    });

    this.changedProductCategories.length = 0;
    this.hasChanges = false;
    this.canEdit = false;
    this.canSave = true;
  }

  private getYesProductCategories() {
    return this.productCategories.filter(pc => this.hasYesStatus(pc));
  }

  private hasYesStatus(category) {
    return category.statusId === this.projectScopeStatus.Yes;
  }

  private toggleAllGroups(expand: boolean) {
    this.expandedGroups.clear();

    if (expand) {
      this.expandedGroups = new Set(
        this.getYesProductCategories().map(i => i.productCategoryId),
      );
    }
  }

  public hasFurtherDetails(group) {
    let result = group.statusId !== this.projectScopeStatus.Yes;
    if (!result) {
      if (group.products.length) {
        result = !!group.products.find(p => p.isChecked);
      }
    }

    if (!result) {
      if (group.childs) {
        result = !!group.childs.find(
          c => !!c.products.find(p => p.isChecked),
        );
      }
    }
    return result;
  }

  public toggleGroup(groupNo: number) {
    this.hasExpandedState(groupNo)
      ? this.expandedGroups.delete(groupNo)
      : this.expandedGroups.add(groupNo);
  }

  public hasExpandedState(groupNo: number) {
    return this.expandedGroups.has(groupNo);
  }
}
