import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';

import { SettlementTemplateComponent } from '@app/modules/shared/settlement-template/settlement-template.component';
import { Settlement } from '@app/models/settlement';
import { ToastService } from '@app/services';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { SettlementState, selectors, actions } from '../state';

@Component({
  selector: 'app-settlements-add',
  templateUrl: './settlements-add.component.html',
})
export class SettlementsAddComponent implements OnInit, OnDestroy {
  @ViewChild(SettlementTemplateComponent) settlementTemplate: SettlementTemplateComponent;

  title: string;

  public error$ = this.store.select(selectors.error);

  readonly awaitedActionTypes = [
    actions.Error.type,
    commonActions.FormInvalid.type,
  ];

  constructor(
    public addNewSettlementModal: BsModalRef,
    private store: Store<SettlementState>,
    private toaster: ToastService,
  ) {
  }

  ngOnInit() {
    this.resetError();
  }

  resetError() {
    this.store.dispatch(actions.ResetCreateSettlementState());
  }

  onSave() {
    if (this.settlementTemplate.validate()) {
      this.store.dispatch(actions.CreateSettlement({
        settlement: { ...this.settlementTemplate.settlement } as Settlement,
        modal: this.addNewSettlementModal,
      }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(commonActions.FormInvalid());
    }
  }

  ngOnDestroy() {
    this.resetError();
  }
}
