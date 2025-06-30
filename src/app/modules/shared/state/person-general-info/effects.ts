import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { mergeMap, switchMap, catchError, tap, withLatestFrom, filter, map } from 'rxjs/operators';

import * as services from '@app/services';
import { Person } from '@app/models';
import * as rootActions from '@app/state/root.actions';
import isString from 'lodash-es/isString';
import { ApiErrorResponse } from '@app/models/api-error-response';
import { SharedPersonGeneralInfoState } from './state';
import * as actions from './actions';
import { personGeneralInfoSelectors as selectors } from './selectors';

@Injectable()
export class PersonGeneralInfoEffects {
  constructor(
    private router: Router,
    private store: Store<SharedPersonGeneralInfoState>,
    private actions$: Actions,
    private personsService: services.PersonsService,
    private toaster: services.ToastService,
  ) { }

  // Details

  getPersonDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPersonDetails),
    switchMap(action => {
      if (!action.id) {
        return EMPTY;
      }

      return this.personsService.get(action.id).pipe(
        mergeMap((response: Person) => [
          actions.GetPersonDetailsComplete({ person: Person.toModel(response) }),
          rootActions.LoadingFinished({ actionName: actions.GetPersonDetails.type }),
        ]),
        catchError((error:string | ApiErrorResponse) => of(actions.PersonDetailsError({ error }))),
      );
    }),
  ));

  getFullSsn$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPersonFullSSN),
    switchMap(({ personId } : { personId: number }) => this.personsService.getFullSsnByPersonId(personId).pipe(
      map((fullSsn:string) => actions.GetPersonFullSSNComplete({ fullSsn })),
      catchError((error: string | ApiErrorResponse) => of(actions.PersonDetailsError({ error }))),
    )),
  ));

  getFullOtherIdentifier$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPersonFullOtherIdentifier),
    switchMap(({ personId } : { personId: number }) => this.personsService.getFullOtherIdentifierByPersonId(personId).pipe(
      map((otherIdentifier:string) => actions.GetPersonFullOtherIdentifierComplete({ otherIdentifier })),
      catchError((error:string | ApiErrorResponse) => of(actions.PersonDetailsError({ error }))),
    )),
  ));

  refreshPerson$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshPerson),
    withLatestFrom(this.store.select(selectors.person)),
    filter(([, person]) => !!person),
    switchMap(([, person]) => [
      actions.GetPersonDetails({ id: person.id }),
    ]),
  ));

  // Save

  updatePersonDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveUpdatedPerson),
    mergeMap(action => this.personsService.put(Person.toDto(action.person)).pipe(
      switchMap((response:Person) => {
        action.callback();

        return [actions.SaveUpdatedPersonComplete({ updatedPerson: Person.toModel(response) })];
      }),
      catchError((error:string | ApiErrorResponse) => of(actions.PersonDetailsError({ error }))),
    )),
  ));

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveUpdatedPersonComplete),
    tap(() => this.toaster.showSuccess('Person was updated')),
  ), { dispatch: false });

  deletePerson$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeletePerson),
    mergeMap(action => this.personsService.delete(action.personId).pipe(
      switchMap(() => {
        action.callback();

        return [
          actions.GoToPersons(),
          actions.DeletePersonComplete(),
        ];
      }),
      catchError((error:string | ApiErrorResponse) => of(actions.PersonDetailsError({ error }))),
    )),
  ));

  deletePersonComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeletePersonComplete),
    tap(() => this.toaster.showSuccess('Person was deleted')),
  ), { dispatch: false });

  goToPersons$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToPersons),
    tap(() => this.router.navigate(['dashboard', 'persons'], { state: { restoreSearch: true } })),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.PersonDetailsError),
    filter(action => isString(action.error)),
    tap(action => this.toaster.showError(<string>action.error)),
  ), { dispatch: false });

  getPersonStart$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPersonLoadingStarted),
    map(() => rootActions.LoadingStarted({
      actionNames: [
        actions.GetPersonDetails.type,
      ],
    })),
  ));
}
