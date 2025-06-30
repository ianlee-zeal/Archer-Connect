import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of, forkJoin } from 'rxjs';
import { mergeMap, catchError, tap, switchMap, withLatestFrom, filter, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Org } from '@app/models/org';

import * as services from '@app/services';
import * as fromAuth from '@app/modules/auth/state';
import { OrgType } from '@app/models/org-type';
import { Address, BankAccount, IdValue, Project } from '@app/models';
import { DocumentGenerationService, MessageService, ProjectsService } from '@app/services';
import { SideNavMenuService } from '@app/services/navigation/side-nav-menu.service';
import { OrgSideNavMenuService } from '@app/services/navigation/org-side-nav-menu.service';
import { AddressPipe } from '@app/modules/shared/_pipes/address.pipe';
import * as rootActions from '@app/state/root.actions';
import { authSelectors } from '@app/modules/auth/state';
import { PaymentPreferencesItem } from '@app/models/payment-preferences-item';
import { SearchOptionsHelper } from '@app/helpers';
import * as fromUserAccessPolices from './index';
import * as actions from './actions';
import * as selectors from './selectors';
import { ControllerEndpoints, ExportName } from '@app/models/enums';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { TypedAction } from '@ngrx/store/src/models';
import { DocumentGeneratorRequest } from '@app/models/documents/document-generators/document-generator-request';

@Injectable()
export class UserRoleOrgEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromUserAccessPolices.AppState>,
    private readonly orgsService: services.OrgsService,
    private readonly OrganizationPaymentInstructionService: services.OrganizationPaymentInstructionService,
    private readonly orgTypesService: services.OrgTypesService,
    private readonly addressService: services.AddressService,
    private readonly orgTypeAssignmentsService: services.OrgTypeAssignmentsService,
    private readonly router: Router,
    private readonly toaster: services.ToastService,
    private readonly messageService: MessageService,
    private readonly sideNavMenuService: SideNavMenuService,
    private readonly orgSideNavMenuService: OrgSideNavMenuService,
    private readonly addressPipe: AddressPipe,
    private readonly bankAccountsService: services.BankAccountService,
    private readonly projectsService: ProjectsService,
    private readonly usersService: services.UsersService,
    private docGenerationsService: DocumentGenerationService,
  ) { }

  getOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgsGrid),
    withLatestFrom(this.store$.select(authSelectors.getUser)),
    mergeMap(([action, user]) => this.orgsService.search(action.params?.request)
      .pipe(
        switchMap(response => {
          const { organizations, selectedOrganization } = user;
          const orgModels = response.items.map(org => ({
            ...Org.toModel(org),
            canSwitch: organizations.some(userOrg => userOrg.id === org.id)
            && org.id !== selectedOrganization.id,
          }));

          return [
            actions.GetOrgsGridSuccess({ params: orgModels, agGridParams: action.params, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.GetOrgsGridError({ errorMessage: error, agGridParams: action.params }))),
      )),
  ));

  getAGAdminUsersComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgsGridSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.params, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getAGAdminUsersError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgsGridError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
      action.agGridParams.fail();
    }),
  ), { dispatch: false });

  getOrg$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrg),
    mergeMap(action => forkJoin([this.orgsService.get(action.id)]).pipe(
      switchMap(data => {
        const organization = Org.toModel(data[0]);
        organization.isSubOrg = action.isSubOrg;
        this.orgSideNavMenuService.addNavigationMenuForOrganization(organization.id, this.sideNavMenuService);
        return [
          actions.GetOrgComplete({ data: organization }),
          rootActions.LoadingFinished({ actionName: actions.GetOrg.type }),
        ];
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  refreshOrg$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshOrg),
    withLatestFrom(this.store$.select(fromUserAccessPolices.item)),
    filter(([, value]) => !!value),
    mergeMap(([, value]) => forkJoin([this.orgsService.get(value.id)]).pipe(
      switchMap(data => {
        const org = Org.toModel(data[0]);
        return [actions.RefreshOrgComplete({ data: org })];
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  addOrg$ = createEffect(() => this.actions$.pipe(
    ofType(actions.AddOrg),
    mergeMap(action => this.orgsService.post(action.item).pipe(
      switchMap(data => {
        action.callback(data);
        this.toaster.showSuccess('Organization was created');
        return [];
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  saveOrg$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveOrg),
    withLatestFrom(this.store$.select(fromUserAccessPolices.item)),
    mergeMap(([action, item]) => this.orgsService.updateOrg(item).pipe(
      switchMap(() => {
        action.callback();
        return [actions.SaveOrgComplete()];
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  saveOrgSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveOrgComplete),
    tap(() => [
      this.store$.dispatch(actions.RefreshOrg()),
      this.toaster.showSuccess('Organization was updated'),
    ]),
  ), { dispatch: false });

  deleteOrgs$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteOrgs),
    mergeMap(action => this.orgsService.deleteAll(action.ids).pipe(
      switchMap(() => {
        action.callback();
        return [actions.DeleteOrgComplete()];
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  deleteOrgSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteOrgComplete),
    tap(() => {
      this.toaster.showSuccess('Organization was deleted');
    }),
  ), { dispatch: false });

  gotoOrg$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToOrg),
    tap(action => {
      this.router.navigate([`/admin/user/orgs/${action.id}/my-organization`], { state: { restoreSearch: true, edit: action.edit } });
    }),
  ), { dispatch: false });

  goToSubOrganizationsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToSubOrganizationsList),
    tap(action => {
      this.router.navigate([`/admin/user/orgs/${action.id}/sub-organization`]);
    }),
  ), { dispatch: false });

  goToOrganizationsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToOrganizationsList),
    tap(() => {
      this.router.navigate(['/admin/user/orgs']);
    }),
  ), { dispatch: false });

  gotoOrgDocument$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToOrgDocument),
    tap(action => this.router.navigate([`/admin/user/orgs/${action.id}/documents/${action.docId}/tabs/details`])),
  ), { dispatch: false });

  gotoBankAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToOrganizationBankAccounts),
    tap(({ organizationId }) => {
      this.router.navigate([`/admin/user/orgs/${organizationId}/payment-instructions`]);
    }),
  ), { dispatch: false });

  getOrgTypes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgTypesGrid),
    withLatestFrom(
      this.store$.select(fromUserAccessPolices.item),
    ),
    mergeMap(([action, org]) => this.orgTypesService.getList(action.agGridParams.request)
      .pipe(
        switchMap(response => {
          const orgTypes = response.items.map(OrgType.toModel);
          const primaryOrgType: OrgType = orgTypes.find(type => type.id === org.primaryOrgTypeId);

          if (primaryOrgType) {
            primaryOrgType.isPrimary = true;
          }

          action.agGridParams.success({ rowData: orgTypes, rowCount: response.totalRecordsCount});

          return [
            actions.GetOrgTypesGridComplete({ types: orgTypes, agGridParams: action.agGridParams, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.GetOrgsGridError({ errorMessage: error, agGridParams: action.agGridParams }))),
      )),
  ));

  getOrgTypesComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgTypesGridComplete),
    withLatestFrom(this.store$.select(fromUserAccessPolices.item)),
    mergeMap(([, org]) => this.orgTypeAssignmentsService.getList(org.id)
      .pipe(
        switchMap((orgAssignments: any) => {
          const assignments = orgAssignments ? orgAssignments.map(assignment => assignment.orgTypeId) : [];

          return [actions.GetOrgTypesAssignmentsComplete({ typeIds: assignments })];
        }),
        catchError(error => of(actions.GetOrgTypesAssignmentsError({ errorMessage: error }))),
      )),
  ));

  getOrgTypesError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgTypesGridError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
      action.agGridParams.fail();
    }),
  ), { dispatch: false });

  getOrgTypesAssignments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgTypesAssignments),
    withLatestFrom(this.store$.select(fromUserAccessPolices.item)),
    mergeMap(([, org]) => this.orgTypeAssignmentsService.getList(org.id)
      .pipe(
        switchMap((orgAssignments: any) => [
          actions.GetOrgTypesAssignmentsComplete({ typeIds: orgAssignments.map(organization => organization.orgTypeId) }),
        ]),
        catchError(error => of(actions.GetOrgTypesAssignmentsError({ errorMessage: error }))),
      )),
  ));

  saveOrgTypeAssignments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveOrgTypeAssignments),
    withLatestFrom(
      this.store$.select(fromUserAccessPolices.item),
      this.store$.select(selectors.orgTypesSelectors.selected),
    ),
    mergeMap(([, org, selectedIds]) => {
      if (org.primaryOrgTypeId && !selectedIds.includes(org.primaryOrgTypeId)) {
        return [actions.SaveOrgTypeAssignmentsError({ errorMessage: 'You cannot remove the primary type. To remove this type, please go to the Details tab and select a different primary type first.' })];
      }

      return this.orgTypeAssignmentsService.save(org.id, selectedIds).pipe(
        switchMap((response: any) => [
          actions.ChangeInitiallySelectedOrgTypes({ selectedIds: response.map(assignment => assignment.orgTypeId) }),
          actions.SaveOrgTypeAssignmentsComplete(),
        ]),
        catchError(error => of(actions.SaveOrgTypeAssignmentsError({ errorMessage: error }))),
      );
    }),
  ));

  saveOrgTypeAssignmentsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveOrgTypeAssignmentsComplete),
    tap(() => {
      this.toaster.showSuccess('Assignments were successfully saved');
    }),
  ), { dispatch: false });

  saveOrgTypeAssignmentsError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveOrgTypeAssignmentsError),
    tap(action => {
      this.messageService.showAlertDialog(
        'Error',
        action.errorMessage,
      );
    }),
  ), { dispatch: false });

  getBankAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBankAccounts),
    withLatestFrom(this.store$.select(fromAuth.authSelectors.selectedOrganization)),
    filter(([, org]) => !!org),
    mergeMap(([, org]) => forkJoin(this.orgsService.getBankAccountList(org.id)).pipe(
      switchMap(response => {
        const accounts = response[0].map(BankAccount.toModel);
        return [actions.GetBankAccountsComplete({ accounts })];
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  setDefaultBankAccount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SetDefaultBankAccount),
    mergeMap(params => this.orgsService.setDefaultBankAccount(params.orgId, params.bankAccountId).pipe(
      switchMap(() => [actions.SetDefaultBankAccountSuccess()]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  setDefaultBankAccountSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SetDefaultBankAccountSuccess),
    switchMap(() => [
      this.store$.dispatch(actions.RefreshOrg()),
      this.toaster.showSuccess('Default Bank Account was changed'),
    ]),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(
      actions.Error,
    ),
    map(({ error }) => [this.toaster.showError(error)]),
  ), { dispatch: false });

  getOrgStart$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgLoadingStarted),
    map(action => rootActions.LoadingStarted({ actionNames: action.additionalActionNames || [] })),
  ));

  getDefaultPaymentAddress$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDefaultPaymentAddress),
    mergeMap(params => this.addressService.getDefaultPaymentAddressDropdownValues(params.orgId, params.entityType).pipe(
      switchMap(response => {
        const defaultPaymentAddress = response.map(item => {
          const formatted = Address.toModel(item);
          return new IdValue(formatted.id, this.addressPipe.transform(formatted));
        });
        return [
          actions.GetDefaultPaymentAddressSuccess({ defaultPaymentAddress }),
          rootActions.LoadingFinished({ actionName: actions.GetDefaultPaymentAddress.type }),
        ];
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getPaymentPreferencesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentPreferencesList),
    mergeMap(action => this.OrganizationPaymentInstructionService.getPaymentPreferencesList(action.orgId, action.gridParams.request)
      .pipe(
        switchMap(response => {
          const paymentPreferencesItems = response.items.map(PaymentPreferencesItem.toModel);
          return [actions.GetPaymentPreferencesListSuccess({
            paymentPreferencesItems,
            gridParams: action.gridParams,
            totalRecords: response.totalRecordsCount,
          })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getPaymentPreferencesListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentPreferencesListSuccess),
    tap(action => {
      action.gridParams.success({ rowData: action.paymentPreferencesItems, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshPaymentPreferenceList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshPaymentPreferenceList),
    withLatestFrom(this.store$.select(fromUserAccessPolices.params), this.store$.select(fromUserAccessPolices.item)),
    switchMap(([, gridParams, item]) => [actions.GetPaymentPreferencesList({ orgId: item.id, gridParams })]),
  ));

  getAllProjects$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectsRequest),
    mergeMap(action => this.projectsService.getProjectsList({
      ...SearchOptionsHelper.getFilterRequest([SearchOptionsHelper.getNumberFilter('organization.id', 'number', 'equals', action.orgId)]),
      startRow: 0,
      endRow: -1,
      sortModel: [{ sort: 'asc', colId: 'name' }],
    })
      .pipe(
        switchMap(response => {
          const projectsList = response.items.map(item => (new IdValue(item.id, item.name)));
          return [actions.GetProjectsRequestComplete({ projectsList })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getBankAccountsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBankAccountsList),
    mergeMap(action => this.bankAccountsService.index({
      searchOptions: {
        ...SearchOptionsHelper.getFilterRequest([SearchOptionsHelper.getBooleanFilter('active', 'boolean', 'equals', true)]),
        startRow: 0,
        endRow: -1,
        sortModel: [{ sort: 'asc', colId: 'name' }],
        orgId: action.orgId,
      },
    })
      .pipe(
        switchMap(response => {
          const bankAccountsList = response.items.map(item => (new IdValue(item.id, item.name)));
          return [actions.GetBankAccountsListComplete({ bankAccountsList })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getQsfOrgBankAccountsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSubQsfBankAccountsList),
    mergeMap(action => this.bankAccountsService.index({
      searchOptions: {
        ...SearchOptionsHelper.getFilterRequest([SearchOptionsHelper.getBooleanFilter('active', 'boolean', 'equals', true)]),
        startRow: 0,
        endRow: -1,
        sortModel: [{ sort: 'asc', colId: 'name' }],
        orgId: action.qsfOrgId,
      },
    })
      .pipe(
        switchMap(response => {
          const bankAccountsList = response.items.map(item => (new IdValue(item.id, item.name)));
          return [actions.GetSubQsfBankAccountsListComplete({ bankAccountsList })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getOrgsOptions$ = createEffect(() => this.actions$.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    ofType(actions.SearchOrganizationsByNameRequest),
    mergeMap(action => this.orgsService.searchByName(action.name)
      .pipe(
        switchMap((response: string[]) => [actions.SearchOrganizationsByNameRequestSuccess({ organizationNames: response })]),
        catchError((error: string) => of(actions.SearchOrganizationsByNameRequestError({ error }))),
      )),
  ));

  getProjects$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectGridDataRequest),
    mergeMap(action => this.projectsService.searchProjects(action.orgId, action.gridParams.request)
      .pipe(
        switchMap(response => {
          const projectsModels = response.items.map(Project.toModel);

          return [actions.GetProjectGridDataRequestComplete({
            projects: projectsModels,
            gridParams: action.gridParams,
            totalRecords: response.totalRecordsCount,
          })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectGridDataRequestComplete),
    tap(action => {
      action.gridParams.success({ rowData: action.projects, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  downloadOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadOrgs),
    mergeMap(action => this.orgsService.export(ExportName[ExportName.Claimants], action.channelName, action.agGridParams.request).pipe(
      switchMap(data => [actions.DownloadOrgsComplete({ channel: data })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  generateDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GenerateDocuments),
    mergeMap((action: {
      controller: ControllerEndpoints;
      request: DocumentGeneratorRequest;
    } & TypedAction<'[Admin-User-Orgs] Generate Documents'>) => this.docGenerationsService.generateWithoutTemplate(action.controller, action.request)
      .pipe(
        switchMap((generationRequest: SaveDocumentGeneratorRequest) => [actions.GenerateDocumentsComplete({ generationRequest })]),
        catchError(error => of(actions.Error({ error }))),
    )),
  ));

  downloadOrgsDocuments$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DownloadOrgsDocument),
    mergeMap(action => this.orgsService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));


  downloadUsers$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadUsers),
    mergeMap(() => this.usersService.exportInternal().pipe(
      switchMap(() => [
        actions.DownloadUsersComplete(),
      ]),
      catchError(error => of(actions.DownloadUsersError({ errorMessage: error }))),
    )),
  ));

  downloadUserLoginReportExport$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadGeneratedDocument),
    mergeMap(action => this.docGenerationsService.getLatestExports(action.generatorId)
      .pipe(
        switchMap(() => [actions.DownloadGeneratedDocumentSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  generateUserLoginReport$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GenerateUserLoginReport),
    mergeMap(action => this.usersService.exportUserLoginReport(action.request)
      .pipe(
        switchMap((generationRequest: SaveDocumentGeneratorRequest) => [actions.GenerateUserLoginReportComplete({ generationRequest })]),
        catchError(error => of(actions.Error({ error }))),
    )),
  ));
}
