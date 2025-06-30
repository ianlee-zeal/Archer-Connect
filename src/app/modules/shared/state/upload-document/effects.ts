import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, switchMap, catchError, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as services from '../../../../services';
import * as documentUploadActions from './actions';
import { ToastService } from '../../../../services';
import { FilterModelOperation } from '@app/models/advanced-search/filter-model-operation.enum';
import { EntityTypeEnum } from '@app/models/enums';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Injectable()
export class DocumentUploadEffects {
  constructor(
    private readonly documentsService: services.DocumentsService,
    private readonly actions$: Actions,
    private readonly toaster: ToastService,
    private readonly orgsService: services.OrgsService,
    private readonly projectsService: services.ProjectsService,
    private readonly mattersService: services.MattersService,
  ) { }

  createDocument$ = createEffect((): any => this.actions$.pipe(
    ofType(documentUploadActions.CreateDocument),
    mergeMap(action => this.documentsService.createDocument(action.document, action.file, true).pipe(
      switchMap((document: any) => [
        documentUploadActions.CreateDocumentComplete({ document, onDocumentLoaded: action.onDocumentLoaded }),
      ]),
      catchError(error => of(documentUploadActions.DocumentError({ error }))),
    )),
  ));

  createDocumentSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(documentUploadActions.CreateDocumentComplete),
    tap(action => {
      action.onDocumentLoaded(action.document);
      this.toaster.showSuccess('Document was created');
    }),
  ), { dispatch: false });

  getOrgsOptions$ = createEffect(() => this.actions$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    ofType(documentUploadActions.GetOrgsOptionsRequest),
    mergeMap(action => {
      const conditions = [new FilterModel({
        type: 'contains',
        filter: action.search,
        filterType: 'text',
        conditions: [],
        key: 'name',
      })];
      if (!Number.isNaN(Number.parseInt(action.search, 10))) {
        conditions.push(new FilterModel({
          type: 'equals',
          filter: action.search,
          filterType: 'number',
          conditions: [],
          key: 'id',
        }));
      }
      return this.orgsService.searchOrganizations({
        startRow: 0,
        endRow: 25,
        rowGroupCols: [],
        valueCols: [],
        pivotCols: [],
        pivotMode: false,
        groupKeys: [],
        filterModel: action.search
          ? [new FilterModel({ operation: FilterModelOperation.Or, conditions })]
          : [],
        sortModel: [{ sort: 'asc', colId: 'name' }],
      })
      .pipe(
        switchMap(response => {
          const orgsOptions = response.items.map(org => ({ id: org.id, name: `${org.id}-${org.name}` }));
          return [ documentUploadActions.GetOrgsOptionsComplete({ orgsOptions }) ];
        }),
        catchError(error => of(documentUploadActions.GetOrgsOptionsError({ error }))),
      );
    }),
  ));

  getDefaultOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(documentUploadActions.LoadDefaultOrgs),
    mergeMap(action => {
      switch (action.entityTypeId) {
        case EntityTypeEnum.Projects:
          return this.projectsService.getPrimaryFirm(action.entityId)
          .pipe(
            switchMap(org => {
              org.name = `${org.id}-${org.name}`;
              return [ documentUploadActions.LoadDefaultOrgsComplete({ defaultOrgs: [org] }) ];
            }),
            catchError(error => of(documentUploadActions.LoadDefaultOrgsError({ error }))),
          );
        case EntityTypeEnum.Matter:
          return this.mattersService.getPrimaryFirmIdsRelatedSettlements(action.entityId)
          .pipe(
            switchMap(orgs => {
              const orgsOptions = orgs.map(org => ({ id: org.id, name: `${org.id}-${org.name}` }));
              return [ documentUploadActions.LoadDefaultOrgsComplete({ defaultOrgs: orgsOptions }) ];
            }),
            catchError(error => of(documentUploadActions.LoadDefaultOrgsError({ error }))),
          );
      }
    }),
  ));
}
