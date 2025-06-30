import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import * as services from '@app/services';
import { Dictionary } from '@app/models/utils';
import * as rootActions from '@app/state/root.actions';
import * as actions from './actions';
import { KeyValuePair } from '../../../../models/utils/key-value-pair';

@Injectable()
export class TabInfoEffects {
  constructor(
    private readonly service: services.TabInfoService,
    private readonly actions$: Actions,
  ) { }

  readonly getTabsCount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTabsCount),
    mergeMap(action => this.service.getTabsCount(action.entityId, action.entityTypeId, action.tabsList).pipe(
      switchMap((items: KeyValuePair<number, number>[]) => [
        actions.GetTabsCountSuccess({ entityTypeId: action.entityTypeId, tabsCount: new Dictionary<number, number>(items) }),
        rootActions.LoadingFinished({ actionName: actions.GetTabsCount.type }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));
}
