import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mergeMap, catchError, switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Org } from '@app/models/org';

import * as services from '@app/services';
import { GetSubOrgListRequest, GetSubOrgListSuccess, GetSubOrgListError } from './actions';

@Injectable()
export class SubOrgListEffects {
  constructor(
    private actions$: Actions,
    private orgsService: services.OrgsService,
  ) { }


  getSubOrgListRequest$ = createEffect(() => this.actions$.pipe(ofType(GetSubOrgListRequest),
    mergeMap(action => this.orgsService.getSubOrgList(action.orgId, action.params.request)
      .pipe(
        switchMap(response => {
          const orgModels = response.items.map(Org.toModel);
          action.params.success({ rowData: orgModels, rowCount: response.totalRecordsCount});
          return [
            GetSubOrgListSuccess({ params: orgModels, agGridParams: action.params, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(GetSubOrgListError({ errorMessage: error, agGridParams: action.params }))),
      ))));
}
