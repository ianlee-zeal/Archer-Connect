import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, ActionsSubject, Action } from '@ngrx/store';

import { ServerErrorService, ToastService, ValidationService } from '@app/services';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { actions } from '../state';
import { MatterState } from '../state/reducer';

@Component({
  selector: 'app-matter-add',
  templateUrl: './matter-add.component.html',
})
export class MatterAddComponent extends ValidationForm implements OnInit, OnDestroy {
  title: string;
  public matterForm: UntypedFormGroup = new UntypedFormGroup({ matterName: new UntypedFormControl(null, [Validators.required, ValidationService.noWhitespaceBeforeTextValidator], autoFocusFieldAsyncValidator) });
  public ngDestroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(actions.MatterError),
    ).subscribe(data => {
      this.serverErrorService.showServerErrors(this.matterForm, data);
    });
  }

  readonly awaitedActionTypes = [
    actions.CreateMatterSuccess.type,
    actions.MatterError.type,
  ];

  constructor(
    public addNewMatterModal: BsModalRef,
    private actionsSubj: ActionsSubject,
    private store: Store<MatterState>,
    public serverErrorService: ServerErrorService,
    private toaster: ToastService,
  ) {
    super();
  }

  protected get validationForm(): UntypedFormGroup {
    return this.matterForm;
  }

  onCancel(action: Action = null) {
    if (action?.type === actions.MatterError.type) {
      return;
    }
    this.addNewMatterModal.hide();
  }

  onSave() {
    if (super.validate()) {
      this.store.dispatch(actions.CreateMatter({ matterName: this.matterForm.value.matterName }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ClearMatterError());
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
