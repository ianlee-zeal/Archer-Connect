import { Injectable } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { switchMap, catchError, mergeMap, tap } from 'rxjs/operators';
import { OrgsService, SettlementsService, MattersService, BillingRuleTemplateService, ProjectsService, UsersService, ClientContactsService } from '@app/services';
import { AttorneysService } from '@app/services/api/attorneys.service';
import { Org, Settlement, Matter, Project, IdValue, User, PersonContact } from '@app/models';
import { Attorney } from '@app/models/attorney';
import { ProjectContact } from '@app/models/project-contact';
import { SelectHelper } from '@app/helpers/select.helper';
import { BillingRuleRelatedService } from '@app/models/billing-rule/billing-rule-related-service';
import { ProjectContactsService } from '@app/services/project-contacts.service';
import * as actions from './actions';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Injectable()
export class EntitySelectionModalEffects {
  constructor(
    private actions$: Actions,
    private orgsService: OrgsService,
    private attorneysService: AttorneysService,
    private settlementService: SettlementsService,
    private mattersService: MattersService,
    private projectsService: ProjectsService,
    private projectContactsService: ProjectContactsService,
    private clientContactsService: ClientContactsService,
    private billingRuleTemplateService: BillingRuleTemplateService,
    private usersService: UsersService,
  ) {}

  searchCustomers$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchCustomers),
    mergeMap(action => this.orgsService.searchFirms(action.params.request)
      .pipe(
        switchMap(response => {
          const orgModels = response.items.map(Org.toModel);
          return [actions.SearchCustomersSuccess({ items: orgModels, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchCustomersSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchCustomersSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchFirms$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchFirms),
    mergeMap(action => this.orgsService.searchFirms(action.params.request)
      .pipe(
        switchMap(response => {
          const orgModels = response.items.map(Org.toModel);
          return [actions.SearchFirmsSuccess({ items: orgModels, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  SearchFirmsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchFirmsSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchSettlements$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchSettlements),
    mergeMap(action => this.settlementService.search(action.params.request)
      .pipe(
        switchMap(response => {
          const settlements = response.items.map(Settlement.toModel);
          return [actions.SearchSettlementsSuccess({ items: settlements, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchSettlementsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchSettlementsSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchAttorneys$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchAttorneys),
    mergeMap(action => this.attorneysService.search(action.params.request)
      .pipe(
        switchMap(response => {
          const attorneys = response.items.map(Attorney.toModel);
          return [actions.SearchAttorneysSuccess({ items: attorneys, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchAttorneysSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchAttorneysSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchMatters$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchMatters),
    mergeMap(action => this.mattersService.search(action.params.request)
      .pipe(
        switchMap(response => {
          const matters = response.items.map(Matter.toModel);
          return [actions.SearchMattersSuccess({ items: matters, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchMattersSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchMattersSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchProject$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchProjects),
    mergeMap(action => this.projectsService.getProjectsList({
      ...action.params.request,
      filterModel: [
        ...action.params.request.filterModel,
        new FilterModel({
          filter: action.orgId,
          filterType: 'number',
          type: 'equals',
          key: action.key ? action.key : 'orgId',
        }),
      ],
    })
      .pipe(
        switchMap(response => {
          const projects = response.items.map(Project.toModel);
          return [actions.SearchProjectsSuccess({ items: projects, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchProjectSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchProjectsSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchProjectContacts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchProjectContacts),
    mergeMap(action => this.projectContactsService.searchProjectContacts(action.params.request)
      .pipe(
        switchMap(response => {
          const projectContacts = response.items.map(ProjectContact.toModel);
          return [actions.SearchProjectContactsSuccess({ items: projectContacts, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchProjectContactsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchProjectContactsSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchClientContacts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchClientContacts),
    mergeMap(action => this.clientContactsService.searchClientContacts(action.params.request, action.clientId)
      .pipe(
        switchMap(response => {
          const clientContacts = response.items.map(PersonContact.toModel);
          return [actions.SearchClientContactsSuccess({ items: clientContacts, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchClientContactsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchClientContactsSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchQSFAdministrationOrg$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchQSFAdministrationOrg),
    mergeMap(action => this.orgsService.index({ searchOptions: action.params?.request })
      .pipe(
        switchMap(response => {
          const orgModels = response.items.map(Org.toModel);
          return [actions.SearchCustomersSuccess({ items: orgModels, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchQSFAdministrationOrgSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchQSFAdministrationOrgSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchRelatedServices$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchRelatedServices),
    mergeMap(action => this.billingRuleTemplateService.searchServices(action.params.request)
      .pipe(
        switchMap(response => {
          const items: BillingRuleRelatedService[] = response.items.map(item => {
            const serviceOption = SelectHelper.serviceToKeyValuePair(item);
            return { ...item, id: serviceOption.key };
          });

          return [actions.SearchRelatedServicesSuccess({ items, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchRelatedServicesSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchRelatedServicesSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  SearchOrganizations$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchOrganizations),
    mergeMap(action => this.orgsService.searchOrganizations(action.params.request)
      .pipe(
        switchMap(response => {
          const orgModels = response.items.map(Org.toModel);
          return [actions.SearchOrganizationsSuccess({ items: orgModels, params: action.params, totalRecords: response.totalRecordsCount })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  SearchOrganizationsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchOrganizationsSuccess),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  searchRevRecItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchRevRecItems),
    mergeMap(action => this.billingRuleTemplateService.searchRevRecItemsByParams(action.params.request)
      .pipe(
        switchMap(response => {
          const models = response.items.map(i => new IdValue(i.id, i.name));
          action.params.success({ rowData: models, rowCount: response.totalRecordsCount});
          return EMPTY;
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ), { dispatch: false });

  searchInvoicingItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchInvoicingItems),
    mergeMap(action => this.billingRuleTemplateService.searchInvoicingItemsByParams(action.params.request)
      .pipe(
        switchMap(response => {
          const models = response.items.map(i => new IdValue(i.id, i.name));
          action.params.success({ rowData: models, rowCount: response.totalRecordsCount});
          return EMPTY;
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ), { dispatch: false });

  searchArcherUsers$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchArcherUsers),
    mergeMap(action => this.usersService.grid(action.params.request)
      .pipe(
        switchMap(response => {
          const userModels = response.items.map(User.toModel);
          action.params.success({ rowData: userModels, rowCount: response.totalRecordsCount});
          return EMPTY;
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ), { dispatch: false });
}
