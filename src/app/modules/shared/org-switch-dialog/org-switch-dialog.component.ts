import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';

import * as fromAuth from '@app/modules/auth/state';
import * as authActions from '@app/modules/auth/state/auth.actions';

@Component({
  selector: 'app-org-switch-dialog',
  templateUrl: './org-switch-dialog.component.html',
  styleUrls: ['./org-switch-dialog.component.scss']
})
export class OrgSwitchDialogComponent implements OnInit {
  public user$ = this.store.select<any>(fromAuth.authSelectors.getUser);
  public selectedOrgId: number;
  public activeOrgId: number;
  public form: UntypedFormGroup;

  constructor(
    private store: Store<fromAuth.AppState>,
    public modal: BsModalRef) {
  }

  ngOnInit() {
    this.form = new UntypedFormGroup({
      filter: new UntypedFormControl()
    });
  }

  public onSwitch(): void {
    this.store.dispatch(authActions.SelectOrganization({ id: this.selectedOrgId }));
  }

  public onSelectionChanged(id: number): void {
    this.selectedOrgId = id;
  }

  public onCancel(): void {
    this.modal.hide();
  }
}
