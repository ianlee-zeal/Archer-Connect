/* eslint-disable no-restricted-globals */
import { Component, Output, EventEmitter, OnInit, Input, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { GridOptions, ColDef } from 'ag-grid-community';
import { takeUntil, filter } from 'rxjs/operators';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ValidationService as VS } from '@app/services/validation.service';
import { SearchField } from '@app/models/advanced-search/search-field';
import { ModalService, MessageService, PermissionService } from '@app/services';
import { SearchState } from '@app/models/advanced-search/search-state';
import { SsnPipe, DateFormatPipe, PhoneNumberPipe } from '@app/modules/shared/_pipes';

import { AppState } from '@shared/state';
import { ColumnExport } from '@app/models/column-export';
import { PusherService } from '@app/services/pusher.service';
import {
  ExportLoadingStatus,
  ProductWorkflowAdvancedSearchKey as PW,
  ClientWorkflowAdvancedSearchKey as CW, SearchGroupType as SG,
  ClientHoldAdvancedSearchKey as CH, EntityTypeEnum,
  ControllerEndpoints,
  DefaultGlobalSearchType,
  DocumentType,
  JobNameEnum,
  ProductCategory,
} from '@app/models/enums';

import { exportsSelectors } from '@shared/state/exports/selectors';
import * as exportsActions from '@shared/state/exports/actions';
import * as fromRoot from '@app/state';
import * as rootActions from '@app/state/root.actions';
import * as fromAuth from '@app/modules/auth/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { HoldType } from '@app/models/hold-type';
import { SavedSearch } from '@app/models/saved-search';
import { StringHelper } from '@app/helpers';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { ClaimantIdentifier } from '@app/models/claimant-identifiers';
import { InitialModalState } from '@app/models/documents/document-generators';
import { ClaimantStatusEnum } from '@app/models/enums/claimant-status.enum';
import { ObservableOptionsHelper } from '@app/helpers/observable-options.helper';
import { GetSavedSearchListByEntityType, ResetCurrentSearch } from '../state/saved-search/actions';
import { ActionHandlersMap } from '../action-bar/action-handlers-map';
import { AdvancedSearchListView } from '../_abstractions/advanced-search-list-view';
import * as productWorkflowActions from '../../product-workflow/state/actions';
import * as selectors from '../state/saved-search/selectors';
import * as clientsListActions from '../state/clients-list/actions';
import { clientsListSelectors } from '../state/clients-list/selectors';
import * as dgActions from '../state/document-generation/actions';
import * as claimantActions from '../../claimants/claimant-details/state/actions';
import { ClaimantDetailsRequest } from '../_abstractions';
import * as claimantSelectors from '../../claimants/claimant-details/state/selectors';
import { SelectHelper } from '../../../helpers/select.helper';
import { SelectOption } from '../_abstractions/base-select';
import { IServerSideGetRowsRequestExtended } from '../_interfaces/ag-grid/ss-get-rows-request';
import { DocumentGenerationTemplates } from '@app/models/enums/document-generation/document-generation-templates';

@Component({
  selector: 'app-clients-list',
  templateUrl: './client-list.component.html',
})
export class ClientListComponent extends AdvancedSearchListView implements OnInit {
  @Input() public gridId: GridId;
  @Output() public rowDoubleClicked = new EventEmitter();
  @Output() public dataChanged = new EventEmitter<IServerSideGetRowsRequestExtended>();
  entityType: EntityTypeEnum = EntityTypeEnum.Clients;
  public readonly advancedSearch$ = this.store.select(clientsListSelectors.advancedSearch);
  public savedSearchOptions$ = this.store.select(selectors.savedSearchSelectors.savedSearchListByEntityType);
  public gender$ = this.store.select(fromRoot.genderDropdownValues);
  public maritalStatuses$ = this.store.select(fromRoot.maritalStatusesDropdownValues);
  public statuses$ = this.store.select(fromRoot.entityStatuses);
  public lienStatuses$ = this.store.select(fromRoot.clientFinalizedStatuses);
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  public currentSearch$ = this.store.select(selectors.savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
  private readonly stages$ = this.store.select(claimantSelectors.ledgerStages);
  private readonly holdTypes$ = this.store.select(claimantSelectors.holdTypes);

  private timezone: string;
  private readonly holdTypeReasons: SelectOption[] = [];

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Client ID',
        field: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'SSN',
        field: 'person.cleanSsn',
        sortable: true,
        cellRenderer: data => this.ssnPipe.transform(data.value),
        ...AGGridHelper.getCustomTextColumnFilter({ stripDashes: true }),
        ...AGGridHelper.ssnColumnDefaultParams,
      },
      {
        headerName: 'Date of Birth',
        field: 'person.dateOfBirth',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        tooltipValueGetter: () => null,
      },
      {
        headerName: 'Phone Number',
        field: 'person.primaryPhone.number',
        colId: 'person.primaryPhone.cleanNumber',
        cellRenderer: data => this.phoneNumberPipe.transform(data.value),
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ stripDashes: true }),
        ...AGGridHelper.phoneColumnDefaultParams,
      },
      {
        headerName: 'State',
        field: 'person.primaryAddress.state',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.stateColumnDefaultParams,
      },
      {
        headerName: 'Project ID',
        field: 'caseId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Project Name',
        field: 'case.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Primary Firm',
        field: 'org.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Total Allocation',
        field: 'totalAllocation',
        sortable: true,
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Address Line 1',
        field: 'person.primaryAddress.lineOne',
        hide: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'City',
        field: 'person.primaryAddress.city',
        hide: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Zip Code',
        field: 'person.primaryAddress.zipCode',
        hide: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Date of Death',
        field: 'person.dateOfDeath',
        colId: 'dod',
        hide: true,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Gender',
        field: 'person.gender',
        hide: true,
        sortable: true,
        ...AGGridHelper.getGenderFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Identifier',
        field: 'externalIdentifiers',
        colId: 'externalIdentifiers.identifier',
        hide: true,
        sortable: true,
        valueGetter: this.identifierValueGetter.bind(this),
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },

      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        hide: true,
        sortable: true,
        cellRenderer: params => this.datePipe.transform(params.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Marital Status',
        field: 'person.maritalStatus.name',
        colId: 'person.maritalStatusId',
        hide: true,
        sortable: true,
        ...AGGridHelper.getMaritalStatusFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Middle Name',
        field: 'person.middleName',
        hide: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Email',
        field: 'person.primaryEmail.email',
        colId: 'person.primaryEmail.emailValue',
        hide: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.emailColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'status.name',
        colId: 'statusId',
        sortable: true,
        minWidth: 110,
        width: 110,
        resizable: false,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: ClaimantStatusEnum.Active,
              name: 'Active',
            },
            {
              id: ClaimantStatusEnum.Inactive,
              name: 'Inactive',
            },
          ],
        }),
      },
      {
        headerName: 'Tort',
        field: 'case.tort',
        hide: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payment Hold Reason',
        field: 'holdTypeReason.holdTypeReasonName',
        colId: 'holdTypeReason.holdTypeReasonId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.holdTypeReasons }),
        minWidth: 170,
      },
      {
        headerName: 'Lien Status',
        field: 'finalizedStatusName',
        colId: 'finalizedStatusId',
        sortable: true,
        ...AGGridHelper.getLienStatusFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Lien Finalized Date',
        field: 'systemFinalizedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        minWidth: 170,
      },
      {
        headerName: 'Injury Date',
        field: 'injuryDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        tooltipValueGetter: () => null,
      },
    ],

    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public setAdvancedSearch(searchTerm: string): void {

    const quickSearchState: SearchState = {
      isAllOptionsSelected: false, options: [],
      field: this.searchFields.find(item => item.key === 'quickSearch'),
      term: searchTerm,
      condition: SC.Contains,
      additionalFields: [], additionalInfo: {}, errors: {}
    }
    this.restoreAdvancedSearch([quickSearchState], true);

    this.advancedSearchSubmit();
    this.showAdvancedSearch = true;
    this.store.dispatch(clientsListActions.SaveAdvancedSearchVisibility({ isVisible: this.showAdvancedSearch }));
  }

  public searchFields: SearchField[] = [
    SearchField.stringIdentifier('externalIdentifiers.identifier', 'Identifier'),
    SearchField.text('quickSearch', 'Quick Search', null, SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals, SC.NotContains, SC.StartsWith, SC.EndsWith], null, StringHelper.stripDashes),
    SearchField.text('firstName', 'First Name'),
    SearchField.text('person.middleName', 'Middle Name'),
    SearchField.text('lastName', 'Last Name'),
    SearchField.stringIdentifier('cleanAttorneyReferenceId', 'Attorney Ref ID', SC.Contains, null, null, StringHelper.stripDashes),
    SearchField.textPrimary('person.emails.emailValue', 'Email Address', 'person.primaryEmail.emailValue', VS.emailValidator, [SC.Equals, SC.NotEqual]),
    SearchField.text('cleanSsn', 'SSN', null, null, null, null, StringHelper.stripDashes),
    SearchField.number('totalAllocation', 'Total Allocation', VS.onlyCurrencyValidator, [SC.IsMissing]),
    SearchField.boolean('hasQSFAdminDeficiencies', 'Has QSF Deficiencies', null, ' '),
    SearchField.boolean('person.addressLinks', 'Address', 'person.addressLinks.isPrimary', 'Primary Only', 'person.addressLinks', [
      SearchField.text('person.addressLinks.address.lineOne', 'Street', null, SC.Contains, [SC.IsMissing]),
      SearchField.text('person.addressLinks.address.city', 'City', null, SC.Contains, [SC.IsMissing]),
      SearchField.text('person.addressLinks.address.state', 'State', null, SC.Contains, [SC.IsMissing]),
      SearchField.text('person.addressLinks.address.zipCode', 'Zip Code', VS.zipCodePartialValidator, SC.Contains, [SC.IsMissing]),
    ]),
    SearchField.none('productWorkflow', 'Workflow - Product', SG.ProductWorkflowGroup, [
      SearchField.data(PW.ProductCategory, 'Category', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains], false),
      SearchField.data(PW.SubProductCategory, 'Sub Category', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains]),
      SearchField.data(PW.Product, 'Product', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains]),
      SearchField.data(PW.Phase, 'Phase', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains]),
      SearchField.data(PW.Stage, 'Stage', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals]),
      SearchField.age(PW.AgeOfPhase, 'Age of Phase', SC.GreaterThan),
      SearchField.age(PW.AgeOfStage, 'Age of Stage', SC.GreaterThan),
    ]),
    SearchField.none('clientWorkflow', 'Workflow - Claimant', SG.ClientWorkflowGroup, [
      SearchField.dataWithCheckbox(CW.ProductCategory, 'Category', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains], false, [ProductCategory.Probate, ProductCategory.Bankruptcy, ProductCategory.MedicalLiens]),
      SearchField.data(CW.Stage, 'Stage', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals]),
      SearchField.age(CW.AgeOfStage, 'Age of Stage', SC.GreaterThan),
    ]),
    SearchField.date('dob', 'Date of Birth', false),
    SearchField.data('person.gender', 'Gender', 'id', 'name', null, [SC.Contains], null, this.gender$),
    SearchField.data('person.maritalStatusId', 'Marital Status', 'id', 'name', null, [SC.Contains], null, this.maritalStatuses$),
    SearchField.number('archerId', 'ARCHER ID', VS.onlyNumbersValidator, null),
    SearchField.text('org.name', 'Primary Firm'),
    SearchField.text('caseId', 'Project ID', VS.onlyNumbersValidator, null, [SC.IsMissing, SC.NotContains, SC.NotEqual, SC.LessThanOrEqual, SC.GreaterThanOrEqual]),
    SearchField.text('case.name', 'Project Name'),
    SearchField.textPrimary('person.phones.cleanNumber', 'Phone Number', 'person.primaryPhone.cleanNumber', null, null, StringHelper.stripDashes),
    SearchField.date('dod', 'Date of Death', false),
    SearchField.date('person.lastModifiedDate', 'Last Modified Date'),
    SearchField.data('statusId', 'Status', 'id', 'name', null, [SC.IsMissing, SC.Contains], null, this.statuses$),
    SearchField.text('case.tort', 'Tort'),
    SearchField.date('injuryDate', 'Injury Date', false),
    SearchField.data(
      'ledgersStages.id',
      'Ledger Stage',
      'id',
      'name',
      SC.Contains,
      [SC.IsMissing, SC.NotEqual, SC.Equals],
      null,
      this.stages$,
    ),
    SearchField.data(CH.HoldTypeReason, 'Claimant Hold', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains], null, ObservableOptionsHelper.getYesNoOptions(), SG.HoldClientGroup, [
      SearchField.data(CH.HoldTypeId, 'Hold Type', 'id', 'name', SC.Equals, [SC.IsMissing, SC.NotEqual, SC.Contains]),
      SearchField.data(CH.HoldTypeReasonId, 'Reason', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals]),
    ]),
    SearchField.date('systemFinalizedDate', 'Lien Finalized Date', false),
    SearchField.data('finalizedStatusId', 'Lien Status', 'id', 'name', null, [SC.Contains], null, this.lienStatuses$),

    // specialized filters
    SearchField.none('probateFinalizedOrNoProbate', 'Probate Finalized or No Probate', SG.Specialized),
    SearchField.none('bankruptcyFinalizedOrNotOnBankruptcy', 'Bankruptcy Finalized or Not On Bankruptcy', SG.Specialized),
    SearchField.none('liensFinalizedOrNoLiens', 'Liens finalized or No Liens', SG.Specialized),
    SearchField.none('defenseApproval', 'Defense approval', SG.Specialized),
    SearchField.none('additionalAllocationMoney', 'Additional allocation money', SG.Specialized),
  ];

  private readonly actionBar: ActionHandlersMap = {
    ...this.savedSearchActionBar,
    clearFilter: this.clearFilterAction(),
    advancedSearch: this.advancedSearchAction(),
    basicSearch: this.basicSearchAction(),
    download: {
      disabled: () => !this.canClearFilters() || this.isExporting || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch),
      options: [
        { name: 'Standard', callback: () => this.exportClientsList(this.getExportColumns()) },
        { name: 'Advanced Export', callback: () => this.documentGenerationExport() },
      ],
    },
    deleteSearch: {
      callback: () => this.deleteSearch(this.currentSearch?.id),
      disabled: () => !this.currentSearch?.id,
      hidden: () => !this.isOnSavedSearch,
    },
    exporting: { hidden: () => !this.isExporting },
  };

  private readonly exportOrder: string[] = [
    'Client ID',
    'ARCHER ID',
    'Attorney Ref ID',
    'First Name',
    'Middle Name',
    'Last Name',
    'SSN',
    'Date of Birth',
    'Date of Death',
    'Phone Number',
    'Project ID',
    'Project Name',
    'Primary Firm',
    'Total Allocation',
    'Injury Category',
    'Status',
    'Gender',
    'Email',
    'Marital Status',
    'Address Line 1',
    'City',
    'State',
    'Zip Code',
    'Prefix',
    'Suffix',
    'Last Modified By',
    'Last Modified Date',
    'Lien Status',
    'Lien Finalized Date',
  ];

  public readonly searchType = DefaultGlobalSearchType.Claimants;

  constructor(
    public store: Store<AppState>,
    public modalService: ModalService,
    public messageService: MessageService,
    public route: ActivatedRoute,
    private actionsSubj: ActionsSubject,
    private ssnPipe: SsnPipe,
    private datePipe: DateFormatPipe,
    private readonly phoneNumberPipe: PhoneNumberPipe,
    protected elementRef: ElementRef,
    protected router: Router,
    private pusher: PusherService,
    permissionService: PermissionService,
  ) {
    super(store, modalService, messageService, route, elementRef, router, permissionService);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(productWorkflowActions.GetProductCategoryDropdownRequest());
    this.store.dispatch(rootActions.GetEntityStatuses({ entityTypeId: EntityTypeEnum.Clients }));
    this.store.dispatch(clientsListActions.UpdateClientsListActionBar({ actionBar: this.actionBar }));
    this.store.dispatch(GetSavedSearchListByEntityType({ entityType: EntityTypeEnum.Clients }));
    this.store.dispatch(claimantActions.GetHoldTypes());

    this.authStore$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.timezone = user.timezone && user.timezone.name;
      this.orgId = user.selectedOrganization.id;
    });

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });

    this.currentSearch$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((savedSearch: SavedSearch) => {
      if (!savedSearch) {
        this.currentSearch = null;
        this.advancedSearchId = null;
        return;
      }

      if (savedSearch.skipRestoring) {
        this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
        this.setAdvancedSearchVisible(false);
        return;
      }

      this.switchIsEditStateTo(false);

      if (savedSearch) {
        this.initSavedSearch(savedSearch);
      }
      this.advancedSearchId = savedSearch?.id;
    });

    this.holdTypes$.pipe(
      filter(holdTypes => !!holdTypes),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((holdTypes: HoldType[]) => {
      this.holdTypeReasons.splice(0);
      holdTypes.forEach(holdType => {
        const reasons = SelectHelper.toOptions(holdType.holdTypeReasons);
        this.holdTypeReasons.push(...reasons);
      });
    });

    this.store.dispatch(claimantActions.GetLedgerStages());

    /* this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((event: NavigationStart) => {
      if (window.location.pathname === '/claimants' && event.url.includes('/saved-search')) {
        this.ngOnDestroy();
      }
    }); */

    // RouteReuseStrategyHelper.processNavigation(this.router, this.elementRef, '/claimants');
  }

  public deleteSearch(searchId: number): void {
    super.deleteSearch(searchId);
    this.router.navigate(['/claimants']);
  }

  public identifierValueGetter(params) {
    const identifiers: ClaimantIdentifier[] = params.data?.externalIdentifiers;
    const identifierFilter = this.gridParams.request?.filterModel.find(item => item.key === 'externalIdentifiers.identifier')?.filter;

    if (identifiers?.length > 0 && identifierFilter) {
      return identifiers.find((item:ClaimantIdentifier) => item.identifier.toLowerCase().includes(identifierFilter.toString().toLowerCase()))?.identifier;
    }
    return params.data.archerId;
  }

  public ngOnChanges(): void {
    if (this.gridApi) {
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);
    /*
    if (this.gridParams) {
       this.gridApi.setFilterModel(this.gridParams.request.filterModel);   commented to fix filter
    }
    */
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    AGGridHelper.replaceSortColIdInSearchRequest(params.request, 'person.maritalStatusId', 'person.maritalStatus.name');

    // eslint-disable-next-line no-param-reassign
    params = this.mergeSearchFilters(params);

    this.gridParams = params;
    this.store.dispatch(clientsListActions.GetAGClients({ params }));
    this.dataChanged.emit(params.request);
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (row) {
      this.rowDoubleClicked.emit(row);
      const claimantDetailsRequest: ClaimantDetailsRequest = { gridParamsRequest: this.gridParams.request };
      this.store.dispatch(claimantActions.SetClaimantDetailsRequest({ claimantDetailsRequest }));
    }
  }

  private exportClientsList(columns: ColDef[]): void {
    const params = this.getExportParams();
    const columnsParam = columns.map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.field,
      };
      return container;
    });
    columnsParam.sort((a, b) => this.exportOrder.indexOf(a.name) - this.exportOrder.indexOf(b.name));

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportClaimants);

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
      this.exportClientsListCallback.bind(this),
      () => {
        this.store.dispatch(clientsListActions.DownloadClients({
          agGridParams: params,
          columns: columnsParam,
          channelName,
        }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.store.dispatch(clientsListActions.UpdateClientsListActionBar({ actionBar: this.actionBar }));
      },
    );
  }

  private documentGenerationExport(): void {
    const documentTypes: number[] = [DocumentType.StatusReport, DocumentType.LienLetter, DocumentType.EVResponse];
    const initialModalState: InitialModalState = {
      name: `${EntityTypeEnum.Clients} Document Generation`,
      controller: ControllerEndpoints.Clients,
      templateTypes: [EntityTypeEnum.Clients],
      entityTypeId: EntityTypeEnum.Clients,
      gridParams: this.mergeSearchFilters(this.gridParams),
      defaultTemplateId: DocumentGenerationTemplates.DigitalDisbursementStatus,
      isSingleExportMode: false,
      documentTypes,
      entityValidationErrors: [],
    };

    this.store.dispatch(dgActions.OpenDocumentGenerationModal({ initialModalState }));
  }

  private exportClientsListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.store.dispatch(clientsListActions.UpdateClientsListActionBar({ actionBar: this.actionBar }));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(clientsListActions.DownloadClientsDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(clientsListActions.Error({ error: { message: `Error exporting: ${data.message}` } }));
        break;
      default:
        break;
    }
  }

  private getExportColumns(): ColDef[] {
    return this.gridOptions.columnDefs.filter(col => this.exportOrder.includes(col.headerName));
  }

  protected saveAdvancedSearch() {
    if (!this.isSearchSaved) {
      this.store.dispatch(clientsListActions.SaveSearchParams({ items: this.searchState }));
    }
  }

  protected toggleAdvancedSearch() {
    super.toggleAdvancedSearch();
    this.store.dispatch(clientsListActions.SaveAdvancedSearchVisibility({ isVisible: this.showAdvancedSearch }));
  }

  public setAdvancedSearchVisible(isVisible: boolean): void {
    this.store.dispatch(clientsListActions.SaveAdvancedSearchVisibility({ isVisible }));
    this.showAdvancedSearch = isVisible;
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.switchIsEditStateTo(false);
    this.store.dispatch(clientsListActions.UpdateClientsListActionBar({ actionBar: null }));

    if (this.isOnSavedSearch && this.isSearchSaved) {
      this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
      this.store.dispatch(clientsListActions.SaveSearchParams({ items: [] }));
    }

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
  }
}
