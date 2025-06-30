import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Store } from '@ngrx/store';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { Maintenance } from '@app/models/admin/maintenance';
import { MaintenanceBanner } from '@app/models/admin/maintenance-banner';
import { filter, Subject, takeUntil } from 'rxjs';
import { ModalService, PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { AppState } from '../../state/state';
import * as maintenanceSelectors from '../state/selectors';
import * as maintenanceActions from '../state/actions';
import { EditBannerModalComponent } from '../edit-banner-modal/edit-banner-modal.component';

@Component({
  selector: 'app-maintenance-mode-page',
  templateUrl: './maintenance-mode-page.component.html',
  styleUrl: './maintenance-mode-page.component.scss',
})
export class MaintenanceModePageComponent extends Editable implements OnInit, OnDestroy {
  protected hasChanges: boolean;
  public title = 'Maintenance Mode';
  private readonly canEditMaintenance = this.permissionService.has(PermissionService.create(PermissionTypeEnum.MaintenanceMode, PermissionActionTypeEnum.Edit));

  public maintenanceList$ = this.store.select(maintenanceSelectors.maintenanceList);
  public maintenanceList: Maintenance[];

  public maintenanceBannerList$ = this.store.select(maintenanceSelectors.maintenanceBannerList);
  public maintenanceBannerList: MaintenanceBanner[];
  public readonly notificationNotSetTooltip = "Prior to setting a notification, you must add notification text by choosing the ‘edit’ button and saving the desired banner text.";

  public ngUnsubscribe$ = new Subject<void>();

  protected get validationForm(): UntypedFormGroup {
    throw new Error('Method not implemented.');
  }

  public actionBarActionHandlers: ActionHandlersMap = {
    save: {
      callback: () => this.onSave(),
      disabled: () => this.canLeave || !this.canEdit,
    },
  };

  constructor(
    private store: Store<AppState>,
    private readonly permissionService: PermissionService,
    private readonly modalService: ModalService,

  ) { super(); }

  ngOnInit(): void {
    this.canEdit = this.canEditMaintenance;
    this.store.dispatch(maintenanceActions.GetMaintenanceList());
    this.maintenanceList$
      .pipe(
        filter((maintenanceList: Maintenance[]) => !!maintenanceList),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((maintenanceList: Maintenance[]) => {
        this.maintenanceList = maintenanceList;
      });

    this.store.dispatch(maintenanceActions.GetMaintenanceBannerList());
    this.maintenanceBannerList$
      .pipe(
        filter((maintenanceBannerList: MaintenanceBanner[]) => !!maintenanceBannerList),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((maintenanceBannerList: MaintenanceBanner[]) => {
        this.maintenanceBannerList = maintenanceBannerList;
      });
  }

  public onCheck(maintenanceId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    const maintenance = this.maintenanceList.find((item: Maintenance) => item.id === maintenanceId);

    if (maintenance) {
      maintenance.value = checked ? '1' : '0';
      this.hasChanges = true;
    }
  }

  public isChecked(maintenanceId: number): boolean {
    const maintenance = this.maintenanceList.find((item: Maintenance) => item.id === maintenanceId);
    return maintenance ? maintenance.value === '1' : false;
  }

  public onCheckBanner(bannerId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    const banner = this.maintenanceBannerList.find((item: MaintenanceBanner) => item.id === bannerId);

    if (banner) {
      banner.isActive = checked;
      this.hasChanges = true;
    }
  }

  onEditClick(maintenanceBanner: MaintenanceBanner) {
    const initialState = { maintenanceBanner: maintenanceBanner };
    this.modalService.show(EditBannerModalComponent, {
      initialState,
      class: 'modal-lg',
    });
  }

  onSave(): void {
    this.store.dispatch(maintenanceActions.UpdateMaintenanceOperation({ maintenanceList: this.maintenanceList, maintenanceBannerList: this.maintenanceBannerList }));
    this.hasChanges = false;
  }

  onBack(): void {
    this.store.dispatch(GotoParentView());
  }

  ngOnDestroy(): void {
    this.hasChanges = false;
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
