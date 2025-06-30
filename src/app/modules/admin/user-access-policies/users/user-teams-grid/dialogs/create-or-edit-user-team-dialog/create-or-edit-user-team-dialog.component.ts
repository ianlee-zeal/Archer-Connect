import { ofType } from '@ngrx/effects';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MessageService, ToastService } from '@app/services';
import { Store, Action, ActionsSubject } from '@ngrx/store';
import { first, map } from 'rxjs/operators';
import { TeamToUser } from '@app/models/team-to-user';
import * as actions from '../../../state/actions';
import * as selectors from '../../../state/selectors';

@Component({
  selector: 'app-create-or-edit-user-team-dialog',
  templateUrl: './create-or-edit-user-team-dialog.component.html',
  styleUrls: ['./create-or-edit-user-team-dialog.component.scss'],
})
export class CreateOrEditUserTeamDialogComponent extends ValidationForm implements OnInit, OnDestroy {
  readonly teams$ = this.store.select(selectors.teams).pipe(
    map(teams => teams.filter(team => !this.usedTeams.has(team.id))),
  );

  readonly isManagerValues = [
    { id: true, name: 'Manager' },
    { id: false, name: 'Team Member' },
  ];

  readonly awaitedActionTypes = [
    actions.CreateOrUpdateUserTeamSuccess.type,
    actions.CreateOrUpdateUserTeamError.type,
    FormInvalid.type,
  ];

  usedTeams: Set<number>;
  team: TeamToUser;
  onSaveFinished: Function;

  form: UntypedFormGroup;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly modalRef: BsModalRef,
    private readonly store: Store,
    private readonly toaster: ToastService,
    private readonly actionsSubject: ActionsSubject,
    private readonly messageService: MessageService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.store.dispatch(actions.GetTeams());

    this.form = this.fb.group({
      id: null,
      teamId: ['', [Validators.required]],
      isManager: [false],
      isActive: [true],
      userId: null,
    });

    this.form.patchValue(this.team);
  }

  onCancel(): void {
    this.modalRef.hide();
  }

  onSave(): void {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(FormInvalid());
      return;
    }

    const team = this.form.getRawValue() as TeamToUser;
    this.store.dispatch(actions.CreateOrUpdateUserTeamRequest({ team, reassign: false }));

    this.actionsSubject.pipe(
      ofType(actions.ShowConfirmationDialogForUserTeamRequest.type),
      first(),
    ).subscribe(() => {
      this.messageService.showConfirmationDialog(
        'Confirm Manager Override',
        'Are you sure you want to reassign a Manager?',
      )
        .subscribe(answer => {
          if (answer) {
            this.store.dispatch(actions.CreateOrUpdateUserTeamRequest({ team, reassign: true }));
          } else {
            this.store.dispatch(FormInvalid());
          }
        });
    });
  }

  onSaveActionFinished(action: Action = null) {
    if (action.type === actions.CreateOrUpdateUserTeamSuccess.type) {
      this.modalRef.hide();
      this.onSaveFinished();
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.ResetCreateUserState());
  }
}
