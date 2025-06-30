import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';

import { PersonTemplateComponent } from '@app/modules/shared/person-template/person-template.component';
import { Person } from '@app/models/person';
import { ToastService } from '@app/services';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { PersonState, selectors, actions } from '../state';

@Component({
  selector: 'app-persons-add',
  templateUrl: './persons-add.component.html',
  styleUrls: ['./persons-add.component.scss'],
})
export class PersonsAddComponent implements OnInit, OnDestroy {
  @ViewChild(PersonTemplateComponent) personTemplate: PersonTemplateComponent;

  title: string;

  public error$ = this.store.select(selectors.error);

  readonly awaitedSaveActionTypes = [
    actions.CreatePersonComplete.type,
    actions.Error,
    FormInvalid.type,
  ];

  constructor(
    public addNewPersonModal: BsModalRef,
    private store: Store<PersonState>,
    private toaster: ToastService,
  ) {
  }

  ngOnInit() {
    this.resetError();
  }

  resetError() {
    this.store.dispatch(actions.ResetCreatePersonState());
  }

  onSave() {
    if (this.personTemplate.validate()) {
      this.store.dispatch(actions.CreatePerson({
        person: { ...this.personTemplate.person } as Person,
        modal: this.addNewPersonModal,
      }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(FormInvalid());
    }
  }

  ngOnDestroy() {
    this.resetError();
  }
}
