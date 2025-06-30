/* eslint-disable no-shadow */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, forkJoin, of } from 'rxjs';
import { mergeMap, catchError, tap, switchMap, withLatestFrom, map, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { ClaimantIdentifier } from '@app/models/claimant-identifiers';
import { ClaimantSummary } from '@app/models/claimant-summary';
import { EntityTypeEnum } from '@app/models/enums';
import { OrganizationEntityAccess } from '@app/models/organization-entity-access';
import {
  OrgsService,
  OrganizationEntityAccessService,
  ToastService,
  ModalService,
  ClientsService,
  PersonsService,
  ClientWorkflowService,
  IdentifiersService,
  StagesService,
  MessageService,
  ClaimSettlementLedgerSettingsService,
  AddressService,
  ClaimClosingStatementSettingsService,
  ProjectsService,
  EmailsService,
  ProductsService,
  UsersService,
  PaymentsSearchService,
  OrganizationPaymentInstructionService
} from '@app/services';

import { DocumentGenerationService } from '@app/services/api/documents/document-generation.service';

import { ClaimantProductDetails } from '@app/models/claimant-product-details';
import { ClaimantElection, KeyValue, ProjectClaimantRequest, FormulaSets, IdValue, Org, User } from '@app/models';
import { DataSource } from '@app/models/dataSource';
import { Claimant } from '@app/models/claimant';
import { LedgerInfo, NetAllocationDetails, ChartOfAccount } from '@app/models/closing-statement';
import { ClientElectionService } from '@app/services/api/client-election.service';
import { LedgersService } from '@app/services/api/ledgers.service';
import { LedgerSummary } from '@app/models/closing-statement/ledger-summary';
import { LedgerEntryInfo } from '@app/models/closing-statement/ledger-entry-info';
import { LedgerVariance } from '@app/models/closing-statement/ledger-variance';
import { PayeeItem } from '@app/models/closing-statement/payee-item';
import isString from 'lodash-es/isString';
import { DisbursementGroupsService } from '@app/services/api/disbursement-groups.service';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { DeficiencyService } from '@app/services/api/deficiency.service';
import { Deficiency } from '@app/models/deficiency';
import { ClaimSettlementLedgerPayee } from '@app/models/ledger-settings';
import { LedgerStageWithClaimantCount } from '@app/models/ledger-stage-with-claimant-count';
import { HoldTypesService } from '@app/services/api/hold-types.service';
import { ClientPaymentHold } from '@app/models/client-payment-hold';
import { ClientPaymentHoldHistory } from '@app/models/client-payment-hold-history';
import { AddressVerificationConfiguration, AddressVerificationRequest } from '@app/models/address';
import { ProbateDetails } from '@app/models/probate-details';
import { PacketRequest } from '@app/models/packet-request';
import { ProbatesService } from '@app/services/api/probates.service';
import { SearchOptionsHelper } from '@app/helpers';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { NEW_ID } from '@app/helpers/constants';
import { ProjectMessagingService } from '@app/services/api/project-messaging.service';
import { ProjectMessage } from '@app/models/projects/project-message';

import * as rootActions from '@app/state/root.actions';
import { sharedActions } from '@app/modules/shared/state';
import * as recentViewsActions from '@app/modules/shared/state/recent-views/actions';
import * as tabInfoActions from '@app/modules/shared/state/tab-info/actions';
import * as addressVerificationActions from '@app/modules/addresses/add-address-modal/address-verification-modal/state/actions';
import { ClaimSettlementLedgerEntry } from '@app/models/claim-settlement-ledger-entry';
import * as actions from './actions';
import * as selectors from './selectors';
import { ClaimantDetailsState } from './reducer';
import { ClaimantOverview } from '../../../../models/claimant-overview/claimant-overview';
import { NetAllocationDetailsModalComponent } from '../disbursements/net-allocation-details-modal/net-allocation-details-modal.component';
import { InactiveReasonsService } from '../../../../services/api/inactive-reasons.service';
import { ClaimantOverviewProbate } from '@app/models/claimant-overview/claimant-overview-probate';
import { LedgerEntryValidationData } from '@app/models/closing-statement/ledger-entry-validation-data';
import { ClaimantOverviewBankruptcy } from '@app/models/claimant-overview/claimant-overview-bankruptcy';
import { ClaimantOverviewReleaseAdmin } from '@app/models/claimant-overview/claimant-overview-release-admin';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { PortalDeficiencyService } from '@app/services/api/portal-deficiency.service';
import { ClaimantDeficiency } from '@app/models/claimant-deficiency';
import { DeficiencyResolutionService } from '@app/services/api/deficiency-resolution.service';

@Injectable()
export class ClaimantDetailsEffects {
  constructor(
    private orgsService: OrgsService,
    private clientsService: ClientsService,
    private ledgersService: LedgersService,
    private clientWorkflowService: ClientWorkflowService,
    private identifiersService: IdentifiersService,
    private personsService: PersonsService,
    private probatesService: ProbatesService,
    private paymentsSearchService: PaymentsSearchService,
    private store$: Store<ClaimantDetailsState>,
    private actions$: Actions,
    private router: Router,
    private organizationEntityAccessService: OrganizationEntityAccessService,
    private toaster: ToastService,
    private modalService: ModalService,
    private documentGenerationService: DocumentGenerationService,
    private clientElectionService: ClientElectionService,
    private stageService: StagesService,
    private messageService: MessageService,
    private claimSettlementLedgerSettingsService: ClaimSettlementLedgerSettingsService,
    private addressesService: AddressService,
    private emailsService: EmailsService,
    private claimClosingStatementsSettingsService: ClaimClosingStatementSettingsService,
    private disbursementGroupsService: DisbursementGroupsService,
    private projectsService: ProjectsService,
    private deficiencyService: DeficiencyService,
    private productsService: ProductsService,
    private holdTypesService: HoldTypesService,
    private addressService: AddressService,
    private usersService: UsersService,
    private inactiveReasonsService: InactiveReasonsService,
    private projectMessagingService: ProjectMessagingService,
    private organizationPaymentInstructionService: OrganizationPaymentInstructionService,
    private portalDeficienciesService: PortalDeficiencyService,
    private deficiencyResolutionService: DeficiencyResolutionService,
  ) { }

  getClaimantStart$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantLoadingStarted),
    map(action => rootActions.LoadingStarted({
      actionNames: [
        actions.GetClaimantRequest.type,
        actions.GetClaimantServices.type,
        actions.GetClaimantIdSummaryRequest.type,
        recentViewsActions.GetRecentViews.type,
        tabInfoActions.GetTabsCount.type,
      ].concat(action.additionalActionNames || [] as any),
    })),
  ));

  getItem$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantRequest),
    mergeMap(action => this.clientsService.get(action.id).pipe(
      switchMap(data => {
        if (!data.personId) {
          this.toaster.showError('Person record does not exist');
        }
        const claimant = Claimant.toModel(data);
        return [
          actions.GetClaimantSuccess({ data: claimant }),
          sharedActions.personGeneralInfoActions.GetPersonDetailsComplete({ person: claimant.person }),
          rootActions.LoadingFinished({ actionName: actions.GetClaimantRequest.type }),
        ];
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getSummaryRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantIdSummaryRequest),
    mergeMap(action => this.clientsService.getClaimantSummaryById(action.id).pipe(
      switchMap(data => [
        actions.GetClaimantIdSummarySuccess({ result: ClaimantSummary.toModel(data) }),
        rootActions.LoadingFinished({ actionName: actions.GetClaimantIdSummaryRequest.type }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  goToCommunicationAttachments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToCommunicationAttachments),
    withLatestFrom(this.store$.select(selectors.item)),
    tap(([action, item]) => {
      this.router.navigate(['claimants', item.id, 'communications', action.communicationId, 'related-documents']);
    }),
  ), { dispatch: false });

  gotoCommunicationsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GotoCommunicationsList),
    withLatestFrom(this.store$.select(selectors.item)),
    tap(([, item]) => {
      this.router.navigate(['claimants', item.id, 'overview', 'tabs', 'communications']);
    }),
  ), { dispatch: false });

  getClaimantDashboardOverviewItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantDashboardOverview),
    mergeMap(action => this.clientsService.getClaimantDashboardOverview(action.claimantId)
      .pipe(
        switchMap((response: any) => [
          actions.GetClaimantDashboardOverviewSuccess({ dashboard: ClaimantOverview.toModel(response) }),
        //  rootActions.LoadingFinished({ actionName: actions.GetClaimantDashboardOverview.type }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getClaimantOverviewProbateItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantOverviewProbateItems),
    mergeMap(action => this.clientsService.getClaimantOverviewProbateItems(action.claimantId)
      .pipe(
        switchMap((response: ClaimantOverviewProbate[]) => [
          actions.GetClaimantOverviewProbateItemsSuccess({ probateItems: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getClaimantOverviewBankruptcyItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantOverviewBankruptcyItems),
    mergeMap(action => {
      return this.clientsService.getClaimantOverviewBankruptcyItems(action.claimantId)
        .pipe(
          switchMap((response: ClaimantOverviewBankruptcy[]) => [
            actions.GetClaimantOverviewBankruptcyItemsSuccess({ bankruptcyItems: response }),
          ]),
          catchError(error => of(actions.Error({ error }))),
        )
    }),
  ));

  getClaimantOverviewRelease$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantOverviewRelease),
    mergeMap(action => {
      return this.clientsService.getClaimantOverviewRelease(action.claimantId)
        .pipe(
          switchMap((response: ClaimantOverviewReleaseAdmin) => [
            actions.GetClaimantOverviewReleaseSuccess({ release: response }),
          ]),
          catchError(error => of(actions.Error({ error }))),
        )
    }),
  ));

  getClaimantDashboardOverviewAdditionalInfo$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantDashboardOverviewAdditionalInfo),
    mergeMap(action => this.clientsService.getClaimantDashboardOverviewAdditionalInfo(action.productCategoryId, action.productCategoryTypeId)
      .pipe(
        switchMap((response: any) => {
          const items: KeyValue[] = response.map(item => (<KeyValue>{
            key: item.label,
            value: item.value,
            dataType: item.dataType,
            sortOrder: item.sortOrder,
          }));

          return [actions.GetClaimantDashboardOverviewAdditionalInfoSuccess({ productCategoryId: action.productCategoryId, items })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getOrganizationAccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrganizationAccessRequest),
    mergeMap(action => this.organizationEntityAccessService.index({
      gridOptions: action.agGridParams.request,
      searchTerm: null,
      entityId: action.claimantId,
      entityType: EntityTypeEnum.Clients,
    })
      .pipe(
        switchMap(response => {
          const items = response.items.map(OrganizationEntityAccess.toModel);
          return [
            actions.GetOrganizationAccessCompleted({ items, agGridParams: action.agGridParams, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getOrganizationAccessComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrganizationAccessCompleted),
    tap(action => {
      action.agGridParams.success({ rowData: action.items, rowCount: action.totalRecords });
    }),
  ), { dispatch: false });

  createOrganizationAccessRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrganizationAccessRequest),
    mergeMap(action => this.organizationEntityAccessService.post({ ...action.item }).pipe(
      switchMap(() => [
        actions.RefreshOrganizationAccessRequest(),
        actions.GetClaimantIdSummaryRequest({ id: action.item.entityId }),
        actions.CreateOrganizationAccessRequestSuccess(),
        actions.GetClaimantTabsCount({ id: action.item.entityId }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  updateOrganizationAccessRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateOrganizationAccessRequest),
    mergeMap(action => this.organizationEntityAccessService.put({ ...action.item }).pipe(
      switchMap(() => [
        actions.RefreshOrganizationAccessRequest(),
        actions.GetClaimantIdSummaryRequest({ id: action.item.entityId }),
        actions.UpdateOrganizationAccessRequestSuccess(),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  updateOrganizationAccessRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateOrganizationAccessRequestSuccess),
    tap(() => this.toaster.showSuccess('Organization access was updated')),
  ), { dispatch: false });

  addOrganizationAccessSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrganizationAccessRequestSuccess),
    tap(() => this.toaster.showSuccess('Organization access granted successfully')),
  ), { dispatch: false });

  deleteOrganizationAccess$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteOrganizationAccessRequest),
    withLatestFrom(this.store$.select(selectors.item)),
    mergeMap(([action, item]) => this.organizationEntityAccessService.delete(action.id).pipe(
      switchMap(() => [
        actions.DeleteOrganizationAccessRequestSuccess(),
        actions.GetClaimantIdSummaryRequest({ id: item.id }),
        actions.RefreshOrganizationAccessRequest(),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  deleteOrganizationAccessSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteOrganizationAccessRequestSuccess),
    map(() => [this.toaster.showSuccess('Organization access was deleted')]),
  ), { dispatch: false });

  closeAddOrganizationAccessModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CloseCreateOrganizationAccessModal),
    tap(() => {
      this.modalService.hide();
    }),
  ), { dispatch: false });

  refreshOrganizationAccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshOrganizationAccessRequest),
    withLatestFrom(this.store$.select(selectors.agGridParams), this.store$.select(selectors.item)),
    switchMap(([, agGridParams, item]) => [
      actions.GetOrganizationAccessRequest({ agGridParams, claimantId: item.id }),
    ]),
  ));

  getServices$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantServices),
    mergeMap(action => this.clientsService.getServices(action.clientId)
      .pipe(
        switchMap(items => [
          rootActions.LoadingFinished({ actionName: actions.GetClaimantServices.type }),
          actions.GetClaimantServicesSuccess({ services: items }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getLedgerInfo$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerInfo),
    mergeMap(({ clientId, ledgerId }) => this.ledgersService.getLedgerInfo(clientId, ledgerId)
      .pipe(
        switchMap(info => [actions.GetLedgerInfoSuccess({ ledgerInfo: LedgerInfo.toModel(info || {}) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getLedgerEntryInfo$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerEntryInfo),
    mergeMap(({ id }) => this.clientsService.getLedgerEntryInfo(id)
      .pipe(
        switchMap(info => [actions.GetLedgerEntryInfoSuccess({ ledgerEntryInfo: LedgerEntryInfo.toModel(info) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  updateLedgerEntryInfo$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateLedgerEntryInfo),
    mergeMap(({ ledgerId, ledgerEntryInfo }) => this.clientsService.updateLedgerEntryInfo(ledgerEntryInfo)
      .pipe(
        switchMap(() => {
          this.toaster.showSuccess('Ledger Entry was updated');
          return [actions.UpdateLedgerEntryInfoSuccess(), actions.RefreshLedgerInfo({ ledgerId })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  authorizeLedgerEntries$ = createEffect(() => this.actions$.pipe(
    ofType(actions.AuthorizeLedgerEntries),
    mergeMap(({ ledgerId, request }) => this.ledgersService.authorizeLedgerEntries(request)
      .pipe(
        switchMap(() => {
          this.toaster.showSuccess('Ledger Entry was authorized');
          return [actions.UpdateLedgerEntryInfoSuccess(), actions.RefreshLedgerInfo({ ledgerId })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  refreshLedgerInfo$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshLedgerInfo),
    withLatestFrom(this.store$.select(selectors.item)),
    mergeMap(([action, item]) => [actions.GetLedgerInfo({
      clientId: item.id,
      ledgerId: action.ledgerId,
    })]),
  ));

  getNetAllocationDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetNetAllocationDetails),
    mergeMap(({ clientId, ledgerInfo }) => this.clientsService.getNetAllocationDetails(clientId, ledgerInfo)
      .pipe(
        switchMap(info => [actions.GetNetAllocationDetailsSuccess({ netAllocationDetails: NetAllocationDetails.toModel(info || {}) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  updateLedgerInfo$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateLedgerInfo),
    mergeMap(({ ledgerId, ledgerInfo }) => this.ledgersService.updateLedgerInfo(ledgerId, ledgerInfo)
      .pipe(
        switchMap(ledgerInfoUpdated => [actions.UpdateLedgerInfoSuccess({ ledgerInfo: LedgerInfo.toModel(ledgerInfoUpdated) })]),
        catchError(error => {
          if (!isString(error) && error?.noToaster) {
            return of(actions.UpdateLedgerInfoError({ error: error.error }));
          }
          return of(actions.Error({ error }));
        }),
      )),
  ));

  updateLedgerAccountGroupsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateLedgerInfoSuccess),
    tap(() => this.toaster.showSuccess('Ledger updated')),
  ), { dispatch: false });

  getLedgerFormulaModes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerFormulaModes),
    mergeMap(() => this.claimSettlementLedgerSettingsService.getFormulaModes()
      .pipe(
        switchMap(formulaModes => [actions.GetLedgerFormulaModesSuccess({ formulaModes })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getFormulaSet$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetFormulaSetByProject),
    mergeMap(action => this.projectsService.getFormulaSet(action.projectId)
      .pipe(
        switchMap(item => [actions.GetFromulaSetByProjectSuccess({ formulaSet: FormulaSets.toModel(item) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProductStagesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductTypesList),
    mergeMap(action => this.productsService.getByProductCategoryIds([action.productCategoryId]).pipe(
      switchMap((data: IdValue[]) => [
        actions.GetProductTypesListSuccess({ types: data }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getQSFTypes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetQSFTypes),
    mergeMap(() => this.productsService.getQSFProducts()
      .pipe(
        switchMap(qsfTypes => [actions.GetQSFTypesSuccess({ qsfTypes })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getHoldTypes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetHoldTypes),
    mergeMap(() => this.holdTypesService.getHoldTypes()
      .pipe(
        switchMap(holdTypes => [actions.GetHoldTypesSuccess({ holdTypes })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjects$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPersonProjects),
    switchMap(action => {
      if (!action.personId) {
        return EMPTY;
      }

      this.store$.dispatch(rootActions.LoadingStarted({ actionNames: [actions.GetPersonProjects.type] }));
      return this.personsService.getProjects(action.personId)
        .pipe(
          mergeMap(items => [
            actions.GetPersonProjectsSuccess({ projects: items?.map(item => ProjectClaimantRequest.toModel(item)) }),
            rootActions.LoadingFinished({ actionName: actions.GetPersonProjects.type }),
          ]),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getClaimantProductDetailsItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductDetails),
    withLatestFrom(this.store$.select(selectors.id)),
    filter(([, claimantId]) => !!claimantId),
    mergeMap(([action, claimantId]) => {
      this.store$.dispatch(rootActions.LoadingStarted({ actionNames: [actions.GetProductDetails.type] }));
      return this.clientsService.getProductDetails(claimantId, action.productCategory)
        .pipe(
          switchMap(data => [
            actions.GetProductDetailsSuccess({ data: ClaimantProductDetails.toModel(data), productCategory: action.productCategory }),
            rootActions.LoadingFinished({ actionName: actions.GetProductDetails.type }),
          ]),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getClaimantCounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantCounts),
    mergeMap(action => this.clientsService.getClaimantCounts(action.clientId)
      .pipe(
        switchMap(data => [actions.GetClaimantCountsSuccess({ claimantCounts: data })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getClaimantWorkflow$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantWorkflow),
    mergeMap(action => this.clientWorkflowService.getByProductCategory(action.productCategoryId, action.claimantId)
      .pipe(
        switchMap(data => [actions.GetClaimantWorkflowSuccess({ clientWorkflow: data })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getClaimantIdentifiers$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantIdentifiersRequest),
    mergeMap(action => this.identifiersService.getClaimantIdentifiers(action.entityId, action.entityTypeId)
      .pipe(
        switchMap((response: any) => {
          const claimantIdentifiers = response?.map(item => ClaimantIdentifier.toModel(item));

          return [
            actions.GetClaimantIdentifiersSuccess({ items: claimantIdentifiers }),
          ];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getDataSource$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDataSource),
    withLatestFrom(this.store$.select(selectors.item)),
    filter(([, claimant]) => !!claimant),
    mergeMap(([action, claimant]) => this.clientsService.getDataSource(claimant.id, action.productCategory)
      .pipe(
        switchMap(data => [actions.GetDataSourceSuccess({ dataSource: DataSource.toModel(data), productCategory: action.productCategory })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getLedgerAccountGroupEntriesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerChartOfAccountsRequest),
    mergeMap(({ projectId }) => this.clientsService.getChartOfAccounts(projectId)
      .pipe(
        switchMap(response => {
          const chartOfAccounts = response.map(i => ChartOfAccount.toModel(i));
          return [actions.GetLedgerChartOfAccountsSuccess({ chartOfAccounts })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getLedgerEntryValidationData$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerEntryValidationData),
    mergeMap(({ caseId }) => this.ledgersService.getLedgerEntryValidationData(caseId)
      .pipe(
        switchMap(response => {
          const ledgerEntryValidationData = LedgerEntryValidationData.toModel(response);
          return [actions.GetLedgerEntryValidationDataSuccess({ ledgerEntryValidationData })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  openNetAllocationDetailsModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OpenNetAllocationDetailsModal),
    tap(() => {
      this.modalService.show(NetAllocationDetailsModalComponent, { class: 'wide-modal' });
    }),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter(action => isString(action.error)),
    tap(({ error }) => {
      this.toaster.showError(error);
    }),
  ), { dispatch: false });

  GenerateDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GenerateDocuments),
    mergeMap(action => this.documentGenerationService.generate(action.controller, action.documentGeneratorRequest)
      .pipe(
        switchMap(data => {
          action.callback(data);
          return [actions.GenerateDocumentsComplete({ data })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  DownloadResults$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadResults),
    withLatestFrom(this.store$.select(selectors.docId)),
    mergeMap(([, docId]) => this.documentGenerationService.getLatestExports(docId).pipe(
      switchMap(() => [
        actions.DownloadResultsComplete(),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getElectionForm$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetElectionForm),
    switchMap(({ id }) => this.clientElectionService.getElectionForm(id)
      .pipe(
        map(data => actions.GetElectionFormSuccess({ electionForm: ClaimantElection.toModel(data || {}) })),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  createOrUpdateElectionForm$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrUpdateElectionForm),
    mergeMap(
      ({ electionForm, file }) => (electionForm.id ? this.clientElectionService.update(electionForm, file) : this.clientElectionService.create(electionForm, file))
        .pipe(
          switchMap(election => ([
            actions.CreateOrUpdateElectionFormSuccess({ electionForm: ClaimantElection.toModel(election), successMessage: electionForm.id ? 'Election Form Updated' : 'Election Form Created' }),
            actions.RefreshElectionFormList({ clientId: election.clientId }),
            actions.GetClaimantIdSummaryRequest({ id: election.clientId }),
          ])),
          catchError(error => of(actions.Error({ error }))),
        ),
    ),
  ));

  deleteElectionFormDocument$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteElectionFormDocument),
    switchMap(action => this.messageService
      .showDeleteConfirmationDialog('Confirm delete', 'Are you sure you want to delete the attached document?')
      .pipe(
        switchMap(isConfirmed => {
          if (isConfirmed) {
            return this.clientElectionService.deleteDocument(action.documentId)
              .pipe(switchMap(() => [actions.DeleteElectionFormDocumentSuccess()]));
          }
          return EMPTY;
        }),
      )),
    catchError(error => of(actions.Error({ error }))),
  ));

  createOrUpdateElectionFormSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrUpdateElectionFormSuccess),
    tap(action => this.toaster.showSuccess(action.successMessage)),
  ), { dispatch: false });

  getElectionFormList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetElectionFormList),
    mergeMap(action => this.clientElectionService.list(action.agGridParams.request, action.clientId).pipe(switchMap(response => {
      const electionFormList = response.items.map(ClaimantElection.toModel);
      return [actions.GetElectionFormListSuccess({
        electionFormList,
        agGridParams: action.agGridParams,
        totalRecords: response.totalRecordsCount,
      }),
      ];
    }), catchError(error => of(actions.Error({ error }))))),
  ));

  getElectionFormListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetElectionFormListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.electionFormList, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshElectionFormList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshElectionFormList),
    withLatestFrom(this.store$.select(selectors.electionFormGridParams)),
    switchMap(([action, agGridParams]) => [
      actions.GetElectionFormList({ clientId: action.clientId, agGridParams }),
    ]),
  ));

  deleteElectionForm$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteElectionForm),
    withLatestFrom(this.store$.select(selectors.item)),
    switchMap(([action, item]) => this.messageService
      .showDeleteConfirmationDialog('Confirm delete', 'Are you sure you want to delete this election form?')
      .pipe(
        switchMap(isConfirmed => {
          if (isConfirmed) {
            return this.clientElectionService.delete(action.electionFormId)
              .pipe(switchMap(() => [actions.DeleteElectionFormSuccess(), actions.RefreshElectionFormList({ clientId: item.id })]));
          }
          return EMPTY;
        }),
      )),
    catchError(error => of(actions.Error({ error }))),
  ));

  verifyElectionFormAddressRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.VerifyElectionFormAddressRequest),
    mergeMap(action => this.addressService.validateAddress(AddressVerificationRequest.toDto(action.address, { includeName: false, advancedAddressCorrection: true } as AddressVerificationConfiguration)).pipe(
      switchMap(result => [
        actions.VerifyElectionFormAddressRequestSuccess({
          close: action.close,
          address: action.address,
          verifiedAddress: result,
          entityName: action.entityName,
          returnAddressOnSave: action.returnAddressOnSave,
        }),
      ]),
      catchError(error => of(actions.VerifyElectionFormAddressRequestError({ error }))),
    )),
  ));

  verifyElectionFormAddressRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.VerifyElectionFormAddressRequestSuccess),
    switchMap(action => [
      addressVerificationActions.OpenModal({ close: action.close, entityName: action.entityName, returnAddressOnSave: action.returnAddressOnSave }),
      addressVerificationActions.VerifyAddressSuccess({ verifiedAddress: action.verifiedAddress }),
    ]),
  ));

  getLedgerStages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerStages),
    switchMap(() => this.stageService.getByEntityTypeId(EntityTypeEnum.ClaimSettlementLedgers).pipe(
      map(stages => actions.GetLedgerStagesSuccess({ ledgerStages: stages })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getLedgerStagesWithClaimantCount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerStagesWithClaimantCount),
    switchMap(action => this.clientsService.getLedgerStagesWithClaimantCount(action.projectId).pipe(
      map(res => actions.GetLedgerStagesWithClaimantCountSuccess({ ledgerStagesWithClaimantCount: res.map(LedgerStageWithClaimantCount.toModel) })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getLedgerSummaryGrid$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerSummaryGrid),
    switchMap(({ clientId }) => this.clientsService.getLedgerSummaryList(clientId).pipe(
      map(list => actions.GetLedgerSummaryGridSuccess({ ledgerSummaryList: list.map(LedgerSummary.toModel) })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  goToElectionFormDetailsPage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToElectionFormDetailsPage),
    tap(({ electionFormId }) => this.router.navigate([`${this.router.url}/${electionFormId}`])),
  ), { dispatch: false });

  getLedgerVariances$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerVariances),
    mergeMap(action => this.clientsService.getLedgerVariances(action.clientId, action.disbursementGroupId).pipe(switchMap(data => {
      const ledgerVariances = data.map(item => LedgerVariance.toModel(item));
      return [actions.GetLedgerVariancesSuccess({ ledgerVariances }),
      ];
    }), catchError(error => of(actions.Error({ error }))))),
  ));

  gotoLedgerDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GotoLedgerDetails),
    tap(action => this.router.navigate([`claimants/${action.claimantId}/payments/tabs/ledger-summary/${action.ledgerId}`])),
  ), { dispatch: false });

  goToClaimantLedgerSummary$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToClaimantLedgerSummary),
    tap(action => this.router.navigate([`/claimants/${action.claimantId}/payments/tabs/ledger-summary`])),
  ), { dispatch: false });

  goToClaimantSummary$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToClaimantSummary),
    tap(action => this.router.navigate([`/projects/${action.projectId}/payments/tabs/claimant-summary`])),
  ), { dispatch: false });

  goToClaimantSummaryRollup$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToClaimantSummaryRollup),
    tap(action => this.router.navigate([`/projects/${action.projectId}/payments/tabs/claimant-summary-rollup`])),
  ), { dispatch: false });

  goToPaymentItemDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToPaymentItemDetails),
    tap(action => this.router.navigate([`/admin/payments/${action.paymentId}/tabs/payment-item-details`])),
  ), { dispatch: false });

  goToTransferItemDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToTransferItemDetails),
    tap(action => this.router.navigate([`/admin/transfers/${action.transferId}/tabs/transfer-item-details`])),
  ), { dispatch: false });

  getDefaultPayeesForLedger$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDefaultPayeesForLedgerEntry),
    mergeMap(action => this.clientsService.getDefaultPayeesForLedgerEntry(action.id).pipe(
      switchMap(payee => [actions.GetDefaultPayeesForLedgerEntrySuccess({ payees: payee })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getPayeesForLedger$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPayeesForLedgerEntry),
    mergeMap(action => this.clientsService.getPayeesForLedgerEntry(action.id).pipe(
      switchMap(payees => [actions.GetPayeesForLedgerEntrySuccess({ payees: payees ? payees.map(ClaimSettlementLedgerPayee.toModel) : null })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getPayeeList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClosingStatementSettingsList),
    mergeMap(action => this.claimClosingStatementsSettingsService.getPayeeList(action.ledgerId)
      .pipe(
        switchMap(response => [
          actions.GetClosingStatementSettingsListSuccess({ payeeItems: response.map(PayeeItem.toModel) }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  updatePayeeList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateClosingStatementSettingsRequest),
    mergeMap(action => this.claimClosingStatementsSettingsService.postPayeeList(action.ledgerId, action.documentDeliveries).pipe(
      switchMap(response => [
        actions.UpdateClosingStatementSettingsSuccess({ payeeItems: response.map(PayeeItem.toModel) }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getTransferOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferOrgAndAccountsForClaimant),
    mergeMap(action => this.organizationPaymentInstructionService.getTransferOrgsForClaimant(action.id).pipe(
      switchMap(orgs => [actions.GetTransferOrgAndAccountsForClaimantSuccess({ transferOrgs: orgs })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getGlobalTransferOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetGlobalTransferOrgAndAccounts),
    mergeMap(() => this.organizationPaymentInstructionService.getGlobalTransferOrgs().pipe(
      switchMap(orgs => [actions.GetGlobalTransferOrgAndAccountsSuccess({ transferOrgs: orgs })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  loadData$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClosingStatementSettingsDataRequest),
    mergeMap(action => forkJoin([
      this.claimSettlementLedgerSettingsService.getElectronicDeliveryProviders(),
      this.claimSettlementLedgerSettingsService.getClosingStatementTemplates(action.projectId, action.isProjectAssociated),
    ]).pipe(
      switchMap(([
        electronicDeliveryProviders,
        closingStatementTemplates,
      ]) => [
        actions.GetClosingStatementSettingsDataSuccess({
          electronicDeliveryProviders,
          closingStatementTemplates,
        }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  updateClosingStatementSettingsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateClosingStatementSettingsSuccess),
    tap(() => this.toaster.showSuccess('Closing Statement Settings was updated')),
  ), { dispatch: false });

  GetClosingStatementSettingsAddressesRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClosingStatementSettingsAddressesRequest),
    mergeMap(({ entityPairs }) => this.addressesService.searchByEntity(entityPairs)
      .pipe(
        map(response => actions.GetClosingStatementSettingsAddressesSuccess({ data: response })),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getClosingStatementSettingsEmailsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClosingStatementSettingsEmailsRequest),
    mergeMap(({ entityPairs }) => this.emailsService.searchByEntity(entityPairs)
      .pipe(
        map(response => actions.GetClosingStatementSettingsEmailsSuccess({ data: response })),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly getClaimantTabsCount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantTabsCount),
    map(action => tabInfoActions.GetTabsCount({
      entityId: action.id,
      entityTypeId: EntityTypeEnum.Clients,
      tabsList: [
        EntityTypeEnum.Addresses,
        EntityTypeEnum.Communications,
        EntityTypeEnum.ClientContacts,
        EntityTypeEnum.Documents,
        EntityTypeEnum.Notes,
        EntityTypeEnum.ClaimantsOrganizationAccess,
      ],
    })),
  ));

  readonly getProbateTabsCount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProbateTabsCount),
    map(action => tabInfoActions.GetTabsCount({
      entityId: action.id,
      entityTypeId: EntityTypeEnum.Probates,
      tabsList: [
        EntityTypeEnum.ClientContacts,
        EntityTypeEnum.Documents,
      ],
    })),
  ));

  getAvailableDisbursementGroupsForElectionFormRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAvailableDisbursementGroupsForElectionFormRequest),
    switchMap(({ clientId, electionFormId }) => this.disbursementGroupsService.getDisbursementGroupsForElectionFormCreation(clientId, electionFormId)
      .pipe(
        map(response => {
          const groups = response.map(DisbursementGroup.toModel);
          return actions.GetAvailableDisbursementGroupsForElectionFormSuccess({ disbursementGroups: groups });
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getDeficienciesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficienciesList),
    withLatestFrom(this.store$.select(selectors.item)),
    mergeMap(([action, item]) => this.deficiencyService.searchClaimantDeficiencies(action.params.request, item.id).pipe(
      switchMap(response => {
        const deficiencies: Deficiency[] = response.items.map(deficiency => Deficiency.toModel(deficiency));
        return [actions.GetDeficienciesListComplete({
          deficiencies,
          agGridParams: action.params,
          totalRecords: response.totalRecordsCount,
        })];
      }),
    )),
  ));

  getDeficienciesListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficienciesListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.deficiencies, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshDeficienciesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshDeficienciesList),
    withLatestFrom(this.store$.select(selectors.deficienciesGridParams)),
    switchMap(([, agGridParams]) => [
      actions.GetDeficienciesList({ params: agGridParams }),
    ]),
  ));

  overrideDeficiency$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OverrideDeficiency),
    mergeMap(action => this.deficiencyService.overrideDeficiency(action.id, action.caseId).pipe(
      switchMap(() => [
        actions.OverrideDeficiencyComplete(),
        actions.RefreshDeficienciesList(),
      ]),
      catchError(error => of(actions.Error({ error }))),

    )),
  ));

  overrideDeficiencyComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OverrideDeficiencyComplete),
    map(() => [this.toaster.showSuccess('Deficiency Cured')]),
  ), { dispatch: false });

  getLedgerOverviewList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerOverviewList),
    mergeMap(action => this.clientsService.getLedgerOverviewList(action.clientId, action.agGridParams.request).pipe(switchMap(response => [actions.GetLedgerOverviewListSuccess({
      ledgerOverview: response.items,
      agGridParams: action.agGridParams,
      totalRecords: response.totalRecordsCount,
    }),
    ]), catchError(error => of(actions.Error({ error }))))),
  ));

  getLedgerOverviewListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerOverviewListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.ledgerOverview, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getLedgerOverviewTotal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLedgerOverviewTotal),
    mergeMap(action => this.clientsService.getLedgerOverviewTotal(action.clientId, action.agGridParams.request).pipe(switchMap(response => [actions.GetLedgerOverviewTotalSuccess({ ledgerOverviewTotal: response }),
    ]), catchError(error => of(actions.Error({ error }))))),
  ));

  putOrUpdateClaimantHold$ = createEffect(() => this.actions$.pipe(
    ofType(actions.PutOrUpdateClaimantHold),
    mergeMap(({ clientPaymentHold }) => this.clientsService.putOrUpdateClaimantHold(clientPaymentHold).pipe(
      switchMap(response => [actions.PutOrUpdateClaimantHoldSuccess({
        clientPaymentHold: {
          ...ClientPaymentHold.toModel(response),
          holdTypeId: clientPaymentHold.holdTypeId,
        },
      })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  putOrUpdateClaimantHoldSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.PutOrUpdateClaimantHoldSuccess),
    tap(() => this.toaster.showSuccess('Updated successfully')),
  ), { dispatch: false });

  deleteLedger$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteLedgerRequest),
    mergeMap(action => this.clientsService.deleteLedger(action.clientId, action.disbursementGroupId, action.preview).pipe(
      switchMap(() => [actions.DeleteLedgerRequestSuccess()]),
      catchError(error => of(actions.DeleteLedgerRequestError({ requestError: error }))),
    )),
  ));

  deleteLedgerPreview$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteLedgerRequestPreview),
    mergeMap(action => this.clientsService.deleteLedger(action.clientId, action.disbursementGroupId, action.preview).pipe(
      switchMap(() => [actions.DeleteLedgerRequestPreviewSuccess()]),
      catchError(error => of(actions.DeleteLedgerRequestError({ requestError: error }))),
    )),
  ));

  deleteLedgerSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteLedgerRequestSuccess),
    tap(() => this.toaster.showSuccess('Ledger was removed.')),
  ), { dispatch: false });

  removeClaimantOnHold$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RemoveClaimantFromHold),
    mergeMap(action => this.clientsService.removeFromHold(action.removeFromHoldData).pipe(
      switchMap(() => [actions.RemoveClaimantFromHoldSuccess()]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  removeClaimantOnHoldSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RemoveClaimantFromHoldSuccess),
    tap(() => this.toaster.showSuccess('Hold was removed')),
  ), { dispatch: false });

  updateClaimantOverviewOnRemove$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RemoveClaimantFromHoldSuccess, actions.PutOrUpdateClaimantHoldSuccess),
    withLatestFrom(this.store$.select(selectors.item)),
    mergeMap(([, item]) => [actions.GetClaimantDashboardOverview({ claimantId: item.id })]),
  ));

  holdPaymentHistoryRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.HoldPaymentHistoryRequest),
    mergeMap(action => this.clientsService.getHoldPaymentHistoryList(action.gridParams.request, action.clientId)
      .pipe(
        switchMap(response => {
          const historyItems = response.items.map(ClientPaymentHoldHistory.toModel);
          return [actions.HoldPaymentHistoryRequestSuccess({
            historyItems,
            gridParams: action.gridParams,
            totalRecords: response.totalRecordsCount,
          })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  holdPaymentHistoryRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.HoldPaymentHistoryRequestSuccess),
    tap(action => {
      action.gridParams.success({ rowData: action.historyItems, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getProbateDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProbateDetailsByClientId),
    mergeMap(action => this.probatesService.getProbateDetailsByClientId(action.clientId)
      .pipe(
        switchMap(item => {
          const probateDetailsItem = item ? ProbateDetails.toModel(item) : new ProbateDetails({ id: NEW_ID });
          return [actions.GetProbateDetailsByClientIdSuccess({ probateDetailsItem })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  updateProbateDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrUpdateProbateDetails),
    mergeMap(action => this.probatesService.updateProbateDetails(ProbateDetails.toDto(action.probateDetails))
      .pipe(
        switchMap(item => {
          const probateDetailsItem = ProbateDetails.toModel(item);
          return [actions.CreateOrUpdateProbateDetailsSuccess({ probateDetailsItem })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  updateProbatePacketRequests$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateProbatePacketRequests),
    mergeMap(({ probateId, packetRequests }) => this.probatesService.updateProbatePacketRequests(probateId, packetRequests).pipe(
      map(packetRequests => packetRequests.map(request => PacketRequest.toModel(request))),
      switchMap(packetRequests => [actions.UpdateProbatePacketRequestsSuccess({ packetRequests })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getProbateStages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProbateStages),
    switchMap(() => this.stageService.getByEntityTypeId(EntityTypeEnum.Probates).pipe(
      map(stages => {
        const probateStages = stages.filter(stage => stage.name !== 'BLANK' && stage.name !== 'NOT MAPPED'); // hidden according to AC-13032
        return actions.GetProbateStagesSuccess({ probateStages });
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getArcherOrgId$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetArcherOrgId),
    mergeMap(() => this.orgsService.index({
      searchOptions: {
        ...SearchOptionsHelper.getFilterRequest([
          SearchOptionsHelper.getBooleanFilter('isMaster', FilterTypes.Boolean, 'equals', true),
        ]),
      },
    })
      .pipe(
        switchMap(({ items }) => {
          const archerId: number = items.find((item: Org) => item.isMaster)?.id;

          return [actions.GetArcherOrgIdSuccess({ archerId })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getUserRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUserRequest),
    mergeMap(action => this.usersService.grid(SearchOptionsHelper.getFilterRequest([
      SearchOptionsHelper.getNumberFilter('id', FilterTypes.Number, 'equals', action.userId),
    ]))
      .pipe(
        switchMap(response => {
          const user = User.toModel(response.items[0]);
          return [
            actions.GetUserRequestSuccess({ user }),
          ];
        }),
      )),
  ));

  getDisbursementGrid$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDisbursementGroupsList),
    mergeMap(({ projectId, claimantId }) => this.projectsService.getDisbursementGroupList(SearchOptionsHelper
      .getFilterRequest([SearchOptionsHelper.getNumberFilter('claimantId', 'number', 'equals', claimantId)]), projectId)
      .pipe(
        map(response => {
          const disbursementGroupList = response.items.map(group => ({ id: group.id, name: group.name }));
          return actions.GetDisbursementGroupsListSuccess({ disbursementGroupList });
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getInactiveReasons$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetInactiveReasons),
    mergeMap(({ entityTypeId }) => this.inactiveReasonsService.getByEntityTypeId(entityTypeId)
      .pipe(
        map(inactiveReasons => actions.GetInactiveReasonsSuccess({ inactiveReasons })),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectMessagesByClientId$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectMessagesByClientId),
    mergeMap(({ clientId }) => this.projectMessagingService.getProjectMessagesByClientId(clientId)
      .pipe(
        switchMap(response => {
          const projectMessages = response?.map(item => ProjectMessage.toModel(item));
          return [actions.GetProjectMessagesByClientIdSuccess({ projectMessages })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  searchByLedgerEntryId$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentsByLedgerEntryId),
    mergeMap(action => this.paymentsSearchService.searchByLedgerEntryId(action.gridParams.request, action.ledgerEntryId)
      .pipe(
        switchMap(response => {
          const items = response.items.map(ClaimSettlementLedgerEntry.toModel);
          action.gridParams.success({ rowData: items, rowCount: response.totalRecordsCount });
          return [
            actions.GetPaymentsByLedgerEntryIdSuccess({ totalCount: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.Error(error))),
      )),
  ));

  GetClientFullPin$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClientFullPin),
    switchMap(({ clientId }: { clientId: number }) => this.clientsService.getFullPinByClientId(clientId).pipe(
      map(fullPin => actions.GetClientFullPinComplete({ fullPin })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  // Final Status Letter
  generateFinalStatusLetter$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GenerateFinalStatusLetter),
    mergeMap(({ clientId, channelName }) => this.clientsService.generateFinalStatusLetter(clientId, channelName)
      .pipe(
        switchMap((generationRequest: SaveDocumentGeneratorRequest) => [actions.GenerateDocumentsComplete({ data: generationRequest })]),
        catchError(error => of(actions.Error({ error }))),
      )),
    ));

  // Claimant Dashboard Deficiencies
  GetPortalDeficienciesCount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPortalDeficienciesCount),
    switchMap(({ clientId }: { clientId: number }) => this.portalDeficienciesService.getPortalDeficienciesCount(clientId).pipe(
      map((uncuredDeficienciesCount: number) => actions.GetUncuredDeficienciesCountComplete({ uncuredDeficienciesCount })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getClaimantDeficienciesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantDeficienciesList),
    mergeMap(action => this.portalDeficienciesService.searchClaimantDeficiencies(action.params.request).pipe(
      switchMap(response => {
        const deficiencies: ClaimantDeficiency[] = response.items.map(deficiency => ClaimantDeficiency.toModel(deficiency));
        return [actions.GetClaimantDeficienciesListSuccess({
          deficiencies,
          agGridParams: action.params,
          totalRecords: response.totalRecordsCount,
        })];
      }),
    )),
  ));

  getClaimantDeficienciesListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantDeficienciesListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.deficiencies, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  resolveDeficiencies$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ResolveDeficiencies),
    mergeMap(action => this.deficiencyResolutionService.resolveDeficiencies(action.deficienciesResolution, action.files).pipe(
      switchMap(() => [
        actions.ResolveDeficienciesSuccess(),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getPendingDeficiencyResolution$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPendingDeficiencyResolutions),
    mergeMap(action => this.deficiencyResolutionService.getPendingDeficiencyResolutions(action.clientId).pipe(
      switchMap(pendingDeficiencies => [actions.GetPendingDeficiencyResolutionsSuccess({ pendingDeficiencies })]),
      catchError(error => of(actions.Error({ error })),
    )),
  )));
}
