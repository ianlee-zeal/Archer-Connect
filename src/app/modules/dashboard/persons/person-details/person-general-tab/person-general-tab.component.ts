import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';

import * as personsSharedActions from '@shared/state/person-general-info/actions';
import { sharedSelectors } from '@app/modules/shared/state';
import { CanLeave } from '@app/modules/shared/_interfaces/can-leave';
import { PersonGeneralInfoComponent } from '@app/modules/shared/person-general-info/person-general-info.component';
import { PersonState } from '../../state/reducer';
import * as actions from '../../state/actions';

@Component({
  selector: 'app-person-general-tab',
  templateUrl: './person-general-tab.component.html',
  styleUrls: ['./person-general-tab.component.scss'],
})
export class PersonGeneralTabComponent implements CanLeave, OnInit, OnDestroy {
  @ViewChild(PersonGeneralInfoComponent)
  personComponent: PersonGeneralInfoComponent;

  private readonly personsActionBar$ = this.store.select(sharedSelectors.personGeneralInfoSelectors.actionBar);
  private readonly ngUnsubscribe$ = new Subject<void>();

  get canLeave(): boolean {
    return this.personComponent.canLeave;
  }

  /**
   * Creates an instance of PersonGeneralTabComponent.
   * @param {Store<PersonState>} store
   * @memberof PersonGeneralTabComponent
   */
  constructor(
    private readonly store: Store<PersonState>,
  ) { }

  /** @inheritdoc */
  ngOnInit(): void {
    this.personsActionBar$.pipe(
      takeUntil(this.ngUnsubscribe$),
      first(actionBar => actionBar !== null),
    )
      .subscribe(actionBar => {
        this.store.dispatch(actions.UpdateActionBar({ actionBar }));
      });
  }

  /**
   * Event handler for save complete event
   *
   * @param {boolean} saveCompleted - flag indicates whether saving is completed or cancelled
   * @memberof PersonGeneralTabComponent
   */
  onSaveComplete(saveCompleted: boolean): void {
    if (!saveCompleted) {
      this.store.dispatch(personsSharedActions.GetPersonDetails({ id: this.personComponent.person.id }));
    }
  }

  /**
   * Cancel event handler
   *
   * @memberof PersonGeneralTabComponent
   */
  onCancel(): void {
    this.store.dispatch(actions.GoBack());
  }

  /** @inheritdoc */
  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
