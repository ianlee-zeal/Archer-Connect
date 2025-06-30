import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { mergeMap, catchError, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';

import { ToastService } from '@app/services';
import * as actions from './actions';
import { IServerSideGetRowsRequestExtended } from '../../_interfaces/ag-grid/ss-get-rows-request';

@Injectable()
export class GridPagerEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly location: Location,
    private readonly toaster: ToastService,
  ) { }

  readonly $paginator = createEffect(() => this.actions$.pipe(
    ofType(actions.Paginator),
    mergeMap(action => {
      const { pageNumber, prevId, params, apiCall, callback } = action;
      const gridParams = this.getSinglePageRequest(params.gridParams, pageNumber - 1);

      const call = params.otherParams
        ? apiCall(gridParams, ...params.otherParams)
        : apiCall(gridParams);

      return call.pipe(
        tap(response => {
          const { id } = response.items[0];
          this.updateUrl(prevId, id);
          callback(id);
        }),
        catchError(error => of(this.toaster.showError(`[Paging failed]: ${error}`))),
      );
    }),
  ), { dispatch: false });

  readonly $paginatorToObject = createEffect(() => this.actions$.pipe(
    ofType(actions.PaginatorToObject),
    mergeMap(action => {
      const { pageNumber, params, apiCall, callback } = action;
      const gridParams = this.getSinglePageRequest(params.gridParams, pageNumber - 1);

      const call = params.otherParams
        ? apiCall(gridParams, ...params.otherParams)
        : apiCall(gridParams);

      return call.pipe(
        tap(response => {
          callback(response.items[0]);
        }),
        catchError(error => of(this.toaster.showError(error))),
      );
    }),
  ), { dispatch: false });

  private getSinglePageRequest(agGridParams: IServerSideGetRowsRequestExtended, index: number) {
    const request = agGridParams;

    if (request) {
      request.startRow = index;
      request.endRow = request.startRow + 1;
    }

    return request;
  }

  private updateUrl(prevId: number, id: number) {
    const newUrl = this.router.url.replace(prevId.toString(), id.toString());

    // No redirect, it will only change the url
    this.location.go(newUrl);
  }
}
