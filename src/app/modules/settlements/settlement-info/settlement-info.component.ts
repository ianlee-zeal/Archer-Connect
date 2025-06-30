import { Component, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { Settlement } from '@app/models';
import { SettlementTemplateComponent } from '@app/modules/shared/settlement-template/settlement-template.component';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { MessageService } from '@app/services/message.service';
import * as services from '@app/services';
import { PermissionService } from '@app/services';
import { PermissionTypeEnum } from '@app/models/enums/permission-type.enum';
import { PermissionActionTypeEnum } from '@app/models/enums/permission-action-type.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { settlementInfoSelectors as selectors } from '@app/modules/shared/state/settlement-info/selectors';
import * as actions from '@app/modules/shared/state/settlement-info/actions';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { SharedSettlementInfoState } from '@app/modules/shared/state/settlement-info/state';

@Component({
  selector: 'app-settlement-info',
  templateUrl: './settlement-info.component.html',
})
export class SettlementInfoComponent extends Editable implements OnInit, OnDestroy {
  @Output() public cancel: EventEmitter<any> = new EventEmitter();

  @Output() public saveComplete: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(SettlementTemplateComponent) settlementComponent: SettlementTemplateComponent;

  public settlement$ = this.store.select(selectors.settlement);

  public settlement: Settlement;

  private actionBar: ActionHandlersMap = {
    save: {
      callback: () => this.onSave(),
      disabled: () => !this.settlementComponent.form.valid,
      hidden: () => !this.canEdit,
      awaitedActionTypes: [
        actions.SaveUpdatedSettlementComplete.type,
        actions.SettlementInfoError.type,
        commonActions.FormInvalid.type,
      ]
    },
    back: {
      callback: () => this.goBack(),
      disabled: () => !this.canLeave,
    },
    cancel: {
      callback: () => this.onCancel(),
      hidden: () => !this.canEdit,
    },
  };

  private ngUnsubscribe$ = new Subject<void>();

  protected get hasChanges(): boolean {
    if (!this.canEdit || !this.settlementComponent) {
      return false;
    }

    return this.settlementComponent.validationForm.dirty;
  }

  protected get validationForm(): UntypedFormGroup {
    return null;
  }

  constructor(
    private readonly store: Store<SharedSettlementInfoState>,
    private readonly messageService: MessageService,
    private readonly toaster: services.ToastService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.canEdit = false;

    this.actionBar.edit = {
      ...this.editAction(),
      permissions: PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Edit),
    };

    this.actionBar.delete = {
      callback: () => this.onDelete(),
      permissions: PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Delete),
    };

    this.store.dispatch(actions.UpdateSettlementInfoActionBar({ actionBar: this.actionBar }));

    this.settlement$
      .pipe(
        filter(settlement => settlement != null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(settlement => {
        this.settlement = settlement;
      });
  }

  private buildSettlement(): Settlement {
    return this.settlement && <Settlement>{
      ...this.settlementComponent.settlement,
    };
  }

  private onDelete(): void {
    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete the settlement?',
    )
      .subscribe(answer => {
        if (answer) {
          this.delete();
        }
      });
  }

  private onCancel() {
    this.editModeOff();
    this.saveComplete.emit();
  }

  protected onSave(): void {
    if (this.validate()) {
      this.store.dispatch(actions.SaveUpdatedSettlement({
        settlement: this.buildSettlement(),
        callback: () => {
          this.editModeOff();
          this.saveComplete.emit(true);
        },
      }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(commonActions.FormInvalid());
    }
  }

  private delete() {
    this.store.dispatch(actions.DeleteSettlement({
      settlementId: this.settlement.id,
      callback: () => this.editModeOff(),
    }));
  }

  private goBack(): void {
    if (this.canEdit) {
      this.editModeOff();
    } else {
      this.store.dispatch(commonActions.GotoParentView());
    }
  }

  public validate() {
    return this.settlementComponent.validate();
  }

  private editModeOff() {
    this.canEdit = false;
    if (this.settlementComponent && this.settlementComponent.form) {
      this.settlementComponent.form.markAsPristine();
    }
  }

  public onChange(): void {
    const newSettlement = this.buildSettlement();

    if (newSettlement) {
      this.store.dispatch(
        actions.UpdateSettlementInfo({
          settlement: newSettlement,
          isSettlementValid: true,
        }),
      );
    }
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateSettlementInfoActionBar({ actionBar: null }));

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
