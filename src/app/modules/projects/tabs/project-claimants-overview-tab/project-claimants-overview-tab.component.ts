import { startWith, Subject, Subscription } from 'rxjs';
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { ofType } from '@ngrx/effects';

import { takeUntil, filter, first } from 'rxjs/operators';
import { GridOptions, ColDef, GetContextMenuItemsParams, MenuItemDef } from 'ag-grid-community';
// eslint-disable-next-line import/no-extraneous-dependencies
import isEqual from 'lodash/isEqual';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { StringHelper } from '@app/helpers/string.helper';
import { EnumToArrayPipe, PhoneNumberPipe, SsnPipe } from '@app/modules/shared/_pipes';
import { ProjectOverviewDashboardConfig, ProjectOverviewDashboardSearchOptions, ColumnExport, DashboardField } from '@app/models';
import { ActionBarService, MessageService, ModalService, PermissionService } from '@app/services';

import { Dictionary } from '@app/models/utils';
import { AdvancedSearchListView } from '@app/modules/shared/_abstractions/advanced-search-list-view';
import { SearchField } from '@app/models/advanced-search/search-field';
import { SearchConditionsEnum as SC, SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';
import { ValidationService as VS } from '@app/services/validation.service';
import {
  ClientWorkflowAdvancedSearchKey as CW, ControllerEndpoints, EntityTypeEnum, ProductWorkflowAdvancedSearchKey as PW, SearchGroupType as SG, ExportLoadingStatus,
  DocumentType, ClientHoldAdvancedSearchKey as CH, JobNameEnum, ProductCategory,
} from '@app/models/enums';

import { AppState, sharedSelectors } from '@shared/state';

import { RelatedPage } from '@app/modules/shared/grid-pager';
import { SearchState } from '@app/models/advanced-search/search-state';
import { ActivatePager, CreatePager } from '@app/modules/shared/state/common.actions';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import { exportsSelectors } from '@shared/state/exports/selectors';
import * as fromRoot from '@app/state';
import * as exportsActions from '@shared/state/exports/actions';
import { PusherService } from '@app/services/pusher.service';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { GridId } from '@app/models/enums/grid-id.enum';
import { savedSearchSelectors } from '@app/modules/shared/state/saved-search/selectors';
import { GetSavedSearchListByEntityType, ResetCurrentSearch } from '@app/modules/shared/state/saved-search/actions';
import { authSelectors } from '@app/modules/auth/state';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { DocumentTemplate, InitialModalState } from '@app/models/documents/document-generators';
import { ClaimantStatusEnum } from '@app/models/enums/claimant-status.enum';
import { HoldType } from '@app/models/hold-type';
import { SelectHelper } from '@app/helpers/select.helper';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ObservableOptionsHelper } from '@app/helpers/observable-options.helper';
import { UrlHelper } from '@app/helpers/url-helper';
import * as dclActions from '../../../liens-dashboards/dashboard-claimants-list/state/actions';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';
import { sharedActions } from '../../../shared/state';
import { KeyValuePair } from '../../../../models/utils/key-value-pair';
import { DateFormatPipe } from '../../../shared/_pipes/date-format.pipe';
import * as claimantActions from '../../../claimants/claimant-details/state/actions';
import * as claimantSelectors from '../../../claimants/claimant-details/state/selectors';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DocumentGenerationTemplates } from '@app/models/enums/document-generation/document-generation-templates';
import { BKScrubStatusCodesEnum } from '@app/models/enums/bk-scrub-status-codes.enum';

/**
 * Defines data sources for project claimants overview tab
 *
 * @enum {number}
 */
enum ProjectClaimantsOverviewTabDataSource {
  /**
   * Regular datasource used in projects when user navigates to the claimants list by himself
   */
  Regular,

  /**
   * Datasource related to the project overview dashboard table
   */
  DashboardFilter,
}

@Component({
  selector: 'app-project-claimants-overview-tab',
  templateUrl: './project-claimants-overview-tab.component.html',
  styleUrls: ['./project-claimants-overview-tab.component.scss'],
})
export class ProjectClaimantsOverviewTabComponent extends AdvancedSearchListView implements OnInit, AfterViewInit {
  public readonly gridId: GridId = GridId.ProjectClaimantsOverview;

  private usedDataSource = ProjectClaimantsOverviewTabDataSource.Regular;
  private dashboardSearchRequest: ProjectOverviewDashboardSearchOptions;
  public savedSearchOptions$ = this.store.select(savedSearchSelectors.savedSearchListByEntityType);
  private clearFilterSubscription: Subscription;
  /**
   * Gets the observable of current action bar
   *
   * @memberof ProjectClaimantsOverviewTabComponent
   */
  readonly actionBar$ = this.store.select(selectors.actionBar);

  entityType: EntityTypeEnum = EntityTypeEnum.Clients;
  public item$ = this.store.select(selectors.item);
  public dashboardClaimantsSearchRequest$ = this.store.select(selectors.projectOverviewDashboardClaimantsSearchRequest);
  public clients$ = this.store.select(selectors.clients);
  public error$ = this.store.select(selectors.error);
  public advancedSearch$ = this.store.select(selectors.projectClaimantsAdvancedSearch);
  public gender$ = this.store.select(fromRoot.genderDropdownValues);
  public maritalStatuses$ = this.store.select(fromRoot.maritalStatusesDropdownValues);
  public statuses$ = this.store.select(fromRoot.entityStatuses);
  public currentSearch$ = this.store.select(savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
  private stages$ = this.store.select(claimantSelectors.ledgerStages);
  private readonly holdTypes$ = this.store.select(claimantSelectors.holdTypes);

  public ngUnsubscribe$ = new Subject<void>();
  public projectId: number;
  public user$ = this.store.select(authSelectors.getUser);
  private activeGridParams: IServerSideGetRowsParamsExtended;
  private readonly holdTypeReasons: SelectOption[] = [];
  public readonly documentGenerationState$ = this.store.select(sharedSelectors.documentGenerationSelectors.root);
  public bKStatusOptions: SelectOption[] = SelectHelper.enumToOptions(BKScrubStatusCodesEnum, (option: SelectOption) => option.id, (option: SelectOption) => option.name);

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Client ID',
        field: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
        pinned: 'left',
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
        pinned: 'left',
      },
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
        pinned: 'left',
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        pinned: 'left',
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        pinned: 'left',
      },
      {
        headerName: 'SSN',
        field: 'person.cleanSsn',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ stripDashes: true }),
        cellRenderer: data => this.ssnPipe.transform(data.value),
        ...AGGridHelper.ssnColumnDefaultParams,
      },
      {
        headerName: 'Date of Birth',
        field: 'person.dateOfBirth',
        sortable: true,
        cellStyle: { textAlign: 'right' },
        headerClass: 'ag-header-right',
        cellRenderer: data => this.dateFormatPipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
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
        headerName: 'Status',
        field: 'status.name',
        colId: 'statusId',
        sortable: true,
        minWidth: 90,
        width: 90,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          defaultValue: ClaimantStatusEnum.Active,
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
        headerName: 'Payment Hold Reason',
        field: 'holdTypeReason.holdTypeReasonName',
        colId: 'holdTypeReason.holdTypeReasonId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.holdTypeReasons }),
        width: 170,
        minWidth: 170,
      },
      {
        headerName: 'BK Scrub Status',
        colId: 'bKScrubStatus.id',
        field: 'bkScrubStatus.name',
        width: 170,
        minWidth: 170,
        suppressSizeToFit: true,
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: ObservableOptionsHelper.getBKStatusFilter() }),
      },
      {
        headerName: 'BK Scrub Last Date',
        colId: 'bKScrubLastDate',
        field: 'bkScrubLastDate',
        width: 170,
        minWidth: 170,
        suppressSizeToFit: true,
        sortable: true,
        cellRenderer: (data: any): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    getContextMenuItems: this.getContextMenuItems,
  };

  public additionalColDefs: ColDef[] = [
    {
      headerName: 'Middle Name',
      field: 'person.middleName',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Gender',
      field: 'person.gender',
      colId: 'gender',
      sortable: true,
      ...AGGridHelper.getGenderFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Email',
      field: 'person.primaryEmail.email',
      colId: 'person.primaryEmail.emailValue',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.emailColumnDefaultParams,
    },
    {
      headerName: 'Marital Status',
      field: 'person.maritalStatus.name',
      colId: 'person.maritalStatusId',
      sortable: true,
      ...AGGridHelper.getMaritalStatusFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Date of Death',
      field: 'person.dateOfDeath',
      colId: 'dod',
      sortable: true,
      cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
      ...AGGridHelper.dateColumnDefaultParams,
      ...AGGridHelper.dateColumnFilter(),
    },
    {
      headerName: 'City',
      field: 'person.primaryAddress.city',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Address Line 1',
      field: 'person.primaryAddress.lineOne',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Zip Code',
      field: 'person.primaryAddress.zipCode',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Prefix',
      field: 'person.prefix',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Suffix',
      field: 'person.suffix',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Injury Category',
      field: 'InjuryCategory',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Last Modified Date',
      field: 'lastModifiedDate',
      sortable: true,
      valueGetter: params => this.datePipe.transform(params.data, false, null, null, true),
      ...AGGridHelper.lastModifiedDateColumnDefaultParams,
      ...AGGridHelper.dateColumnFilter(),
    },
    {
      headerName: 'Last Modified By',
      field: 'lastModifiedBy.displayName',
      sortable: true,
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Project Name',
      field: 'project.name',
      colId: 'case.name',
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
  ];

  public searchFields: SearchField[] = [
    SearchField.text('firstName', 'First Name'),
    SearchField.text('person.middleName', 'Middle Name'),
    SearchField.text('lastName', 'Last Name'),
    SearchField.text('quickSearch', 'Quick Search', null, SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals, SC.NotContains, SC.StartsWith, SC.EndsWith], null, StringHelper.stripDashes),
    SearchField.stringIdentifier('cleanAttorneyReferenceId', 'Attorney Ref ID', SC.Contains, null, null, StringHelper.stripDashes),
    SearchField.textPrimary('person.emails.emailValue', 'Email Address', 'person.primaryEmail.emailValue', VS.emailValidator, [SC.Equals, SC.NotEqual]),
    SearchField.text('cleanSsn', 'SSN', null, null, null, null, StringHelper.stripDashes),
    SearchField.number('totalAllocation', 'Total Allocation', VS.onlyCurrencyValidator, [SC.IsMissing]),
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
    SearchField.date('dob', 'Date of Birth', true),
    SearchField.data('person.gender', 'Gender', 'id', 'name', null, [SC.Contains], null, this.gender$),
    SearchField.data('person.maritalStatusId', 'Marital Status', 'id', 'name', null, [SC.Contains], null, this.maritalStatuses$),
    SearchField.number('archerId', 'ARCHER ID', VS.onlyNumbersValidator, []),
    SearchField.stringIdentifier('externalIdentifiers.identifier', 'Identifier'),
    SearchField.text('org.name', 'Primary Firm'),
    SearchField.textPrimary('person.phones.cleanNumber', 'Phone Number', 'person.primaryPhone.cleanNumber', null, null, StringHelper.stripDashes),
    SearchField.date('dod', 'Date of Death', true),
    SearchField.date('person.lastModifiedDate', 'Last Modified Date'),
    SearchField.data('statusId', 'Status', 'id', 'name', null, [SC.IsMissing, SC.Contains], null, this.statuses$),
    SearchField.data(
      'ledgersStages.id',
      'Ledger Stage ',
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

    // specialized filters
    SearchField.none('probateFinalizedOrNoProbate', 'Probate Finalized or No Probate', SG.Specialized),
    SearchField.none('bankruptcyFinalizedOrNotOnBankruptcy', 'Bankruptcy Finalized or Not On Bankruptcy', SG.Specialized),
    SearchField.none('liensFinalizedOrNoLiens', 'Liens finalized or No Liens', SG.Specialized),
    SearchField.none('defenseApproval', 'Defense approval', SG.Specialized),
    SearchField.none('additionalAllocationMoney', 'Additional allocation money', SG.Specialized),
    SearchField.in('bKScrubStatus.id', 'BK Scrub Status', 'id', 'name', SC.Contains, [SC.IsMissing, SC.NotEqual, SC.Equals], null, this.bKStatusOptions),
    SearchField.date('bKScrubLastDate', 'BK Scrub Last Date', null, [SC.IsMissing]),
  ];

  /**
   * Creates an instance of ProjectClaimantsOverviewTabComponent.
   * @param {Store<fromProjects.AppState>} store
   * @param {SsnPipe} ssnPipe
   * @param {DateFormatPipe} dateFormatPipe
   * @param {ActionBarService} actionBarService
   * @param {Router} router
   * @memberof ProjectClaimantsOverviewTabComponent
   */
  constructor(
    public store: Store<AppState>,
    public modalService: ModalService,
    public messageService: MessageService,
    public route: ActivatedRoute,
    protected readonly router: Router,
    protected elementRef: ElementRef,
    private datePipe: DateFormatPipe,
    private readonly ssnPipe: SsnPipe,
    private readonly dateFormatPipe: DateFormatPipe,
    private readonly actionBarService: ActionBarService,
    private actionsSubj: ActionsSubject,
    private pusher: PusherService,
    private claimantStore: Store<ClaimantDetailsState>,
    private readonly phoneNumberPipe: PhoneNumberPipe,
    private readonly enumToArray: EnumToArrayPipe,
    permissionService: PermissionService,
  ) {
    super(store, modalService, messageService, route, elementRef, router, permissionService);
  }

  /** @inheritdoc */
  ngOnInit(): void {
    this.subscribeOnDashboardClaimantsSearchRequest();

    super.ngOnInit();

    this.actionBar$.pipe(first())
      .subscribe(actionBar => this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));

    this.item$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(item => {
        this.projectId = item.id;
        if (this.usedDataSource === ProjectClaimantsOverviewTabDataSource.DashboardFilter) {
          this.actionBarService
            .clearAllFilters
            .pipe(first())
            .subscribe(() => {
              this.initClearFiltersAction();
              this.store.dispatch(actions.CreateOrUpdateProjectOverviewDashboardClaimantsRequest({ request: null }));
              this.clearFilters();
              this.usedDataSource = ProjectClaimantsOverviewTabDataSource.Regular;
              this.actionBar$.pipe(first())
                .subscribe(actionBar => this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));
            });
          if (!this.clearFilterSubscription) {
            this.clearFilterSubscription = this.actionBarService
              .clearFilter
              .pipe(takeUntil(this.ngUnsubscribe$))
              .subscribe(filterKey => {
                let updatedRequest: ProjectOverviewDashboardSearchOptions;
                switch (filterKey) {
                  case ProjectOverviewDashboardConfig.filterType: // Clear all filters when 'Type' is cleared
                    super.clearFilters();
                    this.usedDataSource = ProjectClaimantsOverviewTabDataSource.Regular;
                    this.actionBar$.pipe(first()).subscribe(actionBar => this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));
                    break;
                  case ProjectOverviewDashboardConfig.filterAge: // If 'Age' is cleared, get data using summary field
                    updatedRequest = { ...this.gridParams.request, ...this.dashboardSearchRequest };
                    updatedRequest.fieldId = updatedRequest.summaryFieldId;
                    updatedRequest.filters.remove(ProjectOverviewDashboardConfig.filterAge);
                    this.updateClearFilterActions(updatedRequest);
                    break;
                  default: {
                    this.clearFilter(filterKey);
                    break;
                  }
                }
              });
          }
        } else if (this.clearFilterSubscription) {
          this.fetchData(this.gridParams);
        }
      });

    this.user$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.orgId = user.selectedOrganization.id;
    });

    this.currentSearch$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(savedSearch => {
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

    this.actionsSubj
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        ofType(actions.GetClaimantsListSuccess, dclActions.GetClaimantsListSuccess),
      ).subscribe(result => {
        this.activeGridParams = result.agGridParams;
      });

    this.store.dispatch(GetSavedSearchListByEntityType({ entityType: EntityTypeEnum.Clients }));
    this.initExportSubscriptions();

    this.store.dispatch(claimantActions.GetLedgerStages());
    this.store.dispatch(claimantActions.GetHoldTypes());
  }

  public ngAfterViewInit(): void {
    this.subscribeToGridUpdates();
  }

  private initExportSubscriptions(): void {
    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.DownloadClientsComplete),
    )
      .subscribe(() => {
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.actionBar$.pipe(first())
          .subscribe(actionBar => this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));
      });
  }

  private getActionBar(actionBar: ActionHandlersMap): ActionHandlersMap {
    return {
      ...actionBar,
      advancedSearch: this.usedDataSource === ProjectClaimantsOverviewTabDataSource.Regular ? this.advancedSearchAction() : null,
      basicSearch: this.usedDataSource === ProjectClaimantsOverviewTabDataSource.Regular ? this.basicSearchAction() : null,
      clearFilter: this.usedDataSource === ProjectClaimantsOverviewTabDataSource.Regular ? this.clearFilterAction() : actionBar?.clearFilter,
      download: {
        disabled: () => this.isExporting || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch),
        options: [
          { name: 'Standard', callback: () => this.exportClientsList(this.getAllColumnDefs()) },
          { name: 'Advanced Export', callback: () => this.openGenerateDocuments() },
        ],
      },
      exporting: { hidden: () => !this.isExporting },
      back: () => this.router.navigate([`projects/${this.projectId}`]),
      ...this.savedSearchActionBar,
    };
  }

  public deleteSearch(searchId: number): void {
    super.deleteSearch(searchId);
    this.router.navigate([`/projects/${this.projectId}/claimants/tabs/overview`]);
  }

  public clearFilters(): void {
    super.clearFilters();
    this.router.navigate([`/projects/${this.projectId}/claimants/tabs/overview`]);
    this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));

    if (this.gridParams) {
      this.gridApi.setFilterModel(null);
    }
  }

  private subscribeOnDashboardClaimantsSearchRequest(): void {
    this.dashboardClaimantsSearchRequest$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(request => {
        this.usedDataSource = request !== null
          ? ProjectClaimantsOverviewTabDataSource.DashboardFilter
          : ProjectClaimantsOverviewTabDataSource.Regular;

        this.dashboardSearchRequest = { ...request };

        if (this.usedDataSource === ProjectClaimantsOverviewTabDataSource.DashboardFilter) {
          this.initClearFiltersAction(request);
        }
      });
  }

  private updateClearFilterActions(updatedRequest: ProjectOverviewDashboardSearchOptions) {
    this.dashboardSearchRequest = updatedRequest;
    this.store.dispatch(actions.GetProjectOverviewDashboardClaimants({
      request: updatedRequest,
      agGridParams: this.gridParams,
    }));
    this.initClearFiltersAction(updatedRequest);
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  public ngOnChanges(): void {
    if (this.gridApi) {
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  protected fetchData(params): void {
    if (this.usedDataSource === ProjectClaimantsOverviewTabDataSource.Regular) {
      params = this.mergeSearchFilters(params);
    }

    this.gridParams = params;
    this.store.dispatch(ActivatePager({ relatedPage: RelatedPage.ProjectsFromSearch }));
    switch (this.usedDataSource) {
      case ProjectClaimantsOverviewTabDataSource.DashboardFilter:
        this.store.dispatch(actions.GetProjectOverviewDashboardClaimants({
          request: { ...this.dashboardSearchRequest, ...params.request, caseId: this.projectId },
          agGridParams: params,
        }));
        break;
      default:
        this.store.dispatch(actions.GetClaimantsList({ projectId: this.projectId, agGridParams: params }));
        break;
    }
  }

  public onRowDoubleClicked(event): void {
    const navSettings = AGGridHelper.getNavSettings(this.gridApi);

    const payload: ClaimantDetailsRequest = {
      id: event.data.id,
      projectId: this.projectId,
      navSettings,
      gridParamsRequest: this.gridParams.request,
      rootProductCategoryId: null,
      filterParameter: this.dashboardSearchRequest ? this.dashboardSearchRequest.filterParameter : null,
      filterValue: this.dashboardSearchRequest ? this.dashboardSearchRequest.filterValue : null,
      fieldId: this.dashboardSearchRequest ? this.dashboardSearchRequest.fieldId : null,
    };
    const relatedPage = this.usedDataSource === ProjectClaimantsOverviewTabDataSource.DashboardFilter
      ? RelatedPage.ClaimantsFromProjectDashboard
      : RelatedPage.ClaimantsFromProject;
    this.store.dispatch(CreatePager({ relatedPage, settings: navSettings, pager: { relatedPage, payload } }));
    this.claimantStore.dispatch(claimantActions.SetClaimantDetailsRequest({ claimantDetailsRequest: payload }));
    this.store.dispatch(actions.GoToClaimantDetails({ claimantDetailsRequest: payload }));
  }

  protected saveAdvancedSearch(): void {
    if (!isEqual(this.searchState, this.savedSearch)) {
      this.store.dispatch(actions.SaveSearchParams({ items: this.searchState }));
    }
  }

  protected restoreAdvancedSearch(searchParams: SearchState[], isVisible: boolean): void {
    if (this.usedDataSource === ProjectClaimantsOverviewTabDataSource.DashboardFilter) {
      this.showAdvancedSearch = false; // we shouldn't restore and show advanced search because this page doesn't have it

      return;
    }

    super.restoreAdvancedSearch(searchParams, isVisible);
  }

  protected toggleAdvancedSearch(): void {
    super.toggleAdvancedSearch();
    this.store.dispatch(actions.SaveAdvancedSearchVisibility({ isVisible: this.showAdvancedSearch }));
  }

  private initClearFiltersAction(request?: ProjectOverviewDashboardSearchOptions) {
    this.actionBarService.initClearFiltersAction(
      this.actionBar$,
      request && request.filters ? request.filters.items().map(f => new KeyValuePair(f.key, f.value.name)) : [],
    ).then(actionBar => {
      if (this.usedDataSource === ProjectClaimantsOverviewTabDataSource.DashboardFilter) {
        this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) }));
      }
    });
  }

  private clearFilter(filterKey: string) {
    const updatedRequest = { ...this.gridParams.request, ...this.dashboardSearchRequest };

    const items = updatedRequest.filters.items();

    const newItems = [];
    let takeNextFilters: boolean;
    let newFilter: DashboardField;

    for (let i = items.length - 1; i >= 0; i--) {
      const checkedItem = items[i];
      if (StringHelper.equal(checkedItem.key, filterKey)) {
        takeNextFilters = true;
        continue;
      }
      if (StringHelper.equal(checkedItem.key, ProjectOverviewDashboardConfig.filterAge)) {
        newItems.push(checkedItem);
        continue;
      }
      if (takeNextFilters) {
        if (!newFilter) {
          newFilter = { ...checkedItem.value };
        }
        newItems.unshift(checkedItem);
      }
    }

    updatedRequest.filters = new Dictionary(newItems);
    updatedRequest.filterParameter = newFilter.filterParameter;
    updatedRequest.filterValue = newFilter.filterValue;

    this.updateClearFilterActions(updatedRequest);
  }

  private openGenerateDocuments(): void {
    const filterModels: FilterModel[] = [];
    if (this.dashboardSearchRequest && this.usedDataSource === ProjectClaimantsOverviewTabDataSource.DashboardFilter) {
      const dashboardFilters = ProjectOverviewDashboardSearchOptions.toFilterModelDto(this.dashboardSearchRequest);
      dashboardFilters.forEach(obj => filterModels.push(obj));
    }
    if (this.usedDataSource === ProjectClaimantsOverviewTabDataSource.Regular) {
      const projectFilter: FilterModel = {
        filter: this.projectId,
        filterTo: null,
        filterType: FilterTypes.Number,
        type: SearchConditionsEnum.Equals,
        dateFrom: null,
        dateTo: null,
        key: 'case.id',
      };
      filterModels.push(projectFilter);
    }

    const gridFilters: FilterModel[] = this.activeGridParams.request.filterModel;
    gridFilters.forEach(obj => filterModels.push(obj));

    const documentTypes: number[] = [DocumentType.StatusReport, DocumentType.LienLetter, DocumentType.EVResponse];
    const initialModalState: InitialModalState = {
      name: `${EntityTypeEnum.Projects} Document Generation`,
      controller: ControllerEndpoints.Projects,
      entityId: this.projectId,
      defaultTemplateId : DocumentGenerationTemplates.DigitalDisbursementStatus,
      entityTypeId: EntityTypeEnum.Projects,
      templateTypes: [EntityTypeEnum.Projects, EntityTypeEnum.Clients],
      gridParams: {
        ...this.activeGridParams,
        request: {
          ...this.activeGridParams.request,
          filterModel: [
            ...filterModels,
          ],
        },
      },
      documentTypes,
      entityValidationErrors: [],
    };
    this.store.dispatch(sharedActions.documentGenerationActions.OpenDocumentGenerationModal({ initialModalState }));

    this.documentGenerationState$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(item => {
       item.data.templateOptions = item.data.templateOptions.filter((template: DocumentTemplate) => template.id !==  DocumentGenerationTemplates.LienStatusReport);
    });
  }

  private readonly exportOrder: string[] = [
    'ARCHER ID',
    'Attorney Ref ID',
    'First Name',
    'Middle Name',
    'Last Name',
    'SSN',
    'Date of Birth',
    'Date of Death',
    'Phone Number',
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
    'BK Scrub Status',
    'BK Scrub Last Date',
  ];

  private exportClientsList(columns: ColDef[]): void {
    const columnsParam = columns.map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.field === 'project.name' ? 'case.name' : item.field,
      };

      if (item.headerName === 'BK Scrub Status') {
        container.field = 'bKScrubStatus.name';
      }

      if (item.headerName === 'BK Scrub Last Date') {
        container.field = 'bKScrubLastDate';
      }

      return container;
    });
    columnsParam.sort((a, b) => this.exportOrder.indexOf(a.name) - this.exportOrder.indexOf(b.name));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportProjectClaimantsList);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.exportClientsListCallback.bind(this),
      () => {
        if (this.usedDataSource === ProjectClaimantsOverviewTabDataSource.DashboardFilter) {
          const dashboardSearchRequest: ProjectOverviewDashboardSearchOptions = {
            ...this.getExportParams().request,
            ...this.dashboardSearchRequest,
          };
          this.store.dispatch(actions.DownloadDashboardClients({ searchOptions: dashboardSearchRequest, columns: columnsParam, channelName }));
        } else {
          this.store.dispatch(actions.DownloadClients({ id: this.projectId, searchOptions: this.getExportParams().request, columns: columnsParam, channelName }));
        }
      },
    );
  }

  private getAllColumnDefs(): ColDef[] {
    return this.additionalColDefs
      ? this.gridOptions.columnDefs.filter(col => !this.additionalColDefs.find(addCol => 'field' in col && addCol.field === col.field))
        .concat(this.additionalColDefs)
      : [].concat(this.gridOptions.columnDefs);
  }

  private exportClientsListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.actionBar$.pipe(first())
      .subscribe(actionBar => this.store.dispatch(actions.UpdateActionBar({ actionBar: this.getActionBar(actionBar) })));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(actions.DownloadDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(actions.Error({ error: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  private getContextMenuItems(params: GetContextMenuItemsParams): (string | MenuItemDef)[] {
    return AGGridHelper.getCustomContextMenu([{
      name: 'Open In a New Tab',
      action: () => UrlHelper.openNewTab(`/claimants/${params.node.data.id}`),
    }]);
  }

  private subscribeToGridUpdates(): void {
    this.route.queryParams.pipe(
      startWith(this.route.snapshot.queryParams),
      filter((queryParams: Params) => Object.keys(queryParams).length > 0),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe((queryParams: Params) => {
        const gridFilters = AGGridHelper.extractFiltersFromQueryParams(queryParams, {
          id: 'number',
          firstName: 'string',
          lastName: 'string',
          searchTerm: 'string',
        });

        const searchTermFilter = (gridFilters.searchTerm || { filter: '' }).filter;
        const quickSearchState: SearchState = {
          isAllOptionsSelected: false, options: [],
          field: this.searchFields.find(item => item.key === 'quickSearch'),
          term: String(searchTermFilter),
          condition: SC.Contains,
          additionalFields: [], additionalInfo: {}, errors: {}
        }
        this.restoreAdvancedSearch([quickSearchState], true);

        this.advancedSearchSubmit();
        this.showAdvancedSearch = true;
        this.store.dispatch(actions.SaveAdvancedSearchVisibility({ isVisible: this.showAdvancedSearch }));
      });
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.usedDataSource === ProjectClaimantsOverviewTabDataSource.Regular) {
      this.saveAdvancedSearch();
    }

    this.switchIsEditStateTo(false);

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    if (this.isOnSavedSearch) {
      this.store.dispatch(actions.SaveSearchParams({ items: [] }));
    }

    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
