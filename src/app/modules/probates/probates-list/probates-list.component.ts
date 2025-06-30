import { ITooltipParams, ColDef, GridOptions, ValueGetterParams } from 'ag-grid-community';
/* eslint-disable no-restricted-globals */
import { ActionHandlersMap } from '@shared/action-bar/action-handlers-map';
import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ActionsSubject, Store } from '@ngrx/store';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ProjectActionPanelCellRendererComponent } from '@app/modules/projects/project-action-panel-cell-renderer/project-action-panel-cell-renderer.component';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ColumnExport, IdValue, PersonContact } from '@app/models';
import { PusherService } from '@app/services/pusher.service';
import { CurrencyHelper, StringHelper } from '@app/helpers';
import { JobNameEnum, ExportLoadingStatus, EntityTypeEnum, ProductCategory, PermissionTypeEnum, StatusEnum } from '@app/models/enums';

import * as fromRoot from '@app/state';
import * as exportsActions from '@shared/state/exports/actions';
import { AdvancedSearchListView } from '@app/modules/shared/_abstractions/advanced-search-list-view';
import { SearchState } from '@app/models/advanced-search/search-state';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { ModalService, MessageService, PermissionService, ValidationService } from '@app/services';
import { filter, takeUntil } from 'rxjs/operators';
import { AppState } from '@app/modules/shared/state';
import { SearchField } from '@app/models/advanced-search/search-field';
import * as selectors from '@app/modules/shared/state/saved-search/selectors';
import { ofType } from '@ngrx/effects';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { SavedSearch } from '@app/models/saved-search';
import * as claimantDetailsActions from '@app/modules/claimants/claimant-details/state/actions';
import * as claimantDetailsSelectors from '@app/modules/claimants/claimant-details/state/selectors';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { HtmlTooltipRendererComponent } from '@app/modules/shared/_renderers/html-tooltip-renderer/html-tooltip-renderer.component';
import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { ValueWithTooltipRendererComponent } from '../../shared/_renderers/value-with-tooltip-renderer/value-with-tooltip-renderer.component';
import * as probateActions from '../state/actions';
import * as probateSelectors from '../state/selectors';
import { DateFormatPipe } from '../../shared/_pipes';
import { GetSavedSearchListByEntityType, ResetCurrentSearch, ShowSavedSearchListByEntityType } from '../../shared/state/saved-search/actions';
import { GenerateFirmUpdateModalComponent, IGenerateFirmUpdateModalData } from './generate-firm-update-modal/generate-firm-update-modal.component';
import { ExportPendingPacketRequestsModalComponent, IExportPendingPacketRequestsModalData } from './export-pending-packet-requests-modal/export-pending-packet-requests-modal.component';

@Component({
  selector: 'app-probates-list',
  templateUrl: './probates-list.component.html',
  styleUrls: ['./probates-list.component.scss'],
})
export class ProbatesListComponent extends AdvancedSearchListView implements OnInit, OnDestroy {
  public readonly gridId = GridId.Probates;
  public readonly entityType = EntityTypeEnum.Probates;

  public packetRequestsStages: IdValue[];
  public isExporting = false;

  public readonly advancedSearch$ = this.store.select(probateSelectors.advancedSearch);
  public readonly actionBar$ = this.store.select(probateSelectors.actionBar);
  public readonly projectsWithProbates$ = this.store.select(probateSelectors.projectsWithProbates);
  public readonly projectsCodesWithProbates$ = this.store.select(probateSelectors.projectsCodesWithProbates);
  public readonly savedSearchOptions$ = this.store.select(selectors.savedSearchSelectors.savedSearchListByEntityType);
  public readonly currentSearch$ = this.store.select(selectors.savedSearchSelectors.currentSearchByEntityType({ entityType: this.entityType }));
  public readonly probateServiceTypes$ = this.store.select(claimantDetailsSelectors.probateServiceTypes);
  public readonly probateStages$ = this.store.select(claimantDetailsSelectors.probateStages);
  public readonly relationshipTypes$ = this.store.select(fromRoot.personRelationshipTypeValues);
  public readonly representativeTypes$ = this.store.select(fromRoot.personRepresentativeTypesValues);
  public readonly packetRequestsStages$ = this.store.select(probateSelectors.packetRequestsStages);

  private readonly probateServiceTypes: SelectOption[] = [];
  private readonly probateStages: SelectOption[] = [];

  private readonly exportFieldValueColumns = new Set([
    'product.id',
    'stage.id',
    'status.id',
  ]);

  private readonly actionBar: ActionHandlersMap = {
    ...this.savedSearchActionBar,
    clearFilter: this.clearFilterAction(),
    advancedSearch: this.advancedSearchAction(),
    basicSearch: this.basicSearchAction(),
    download: {
      disabled: () => this.isExporting || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch),
      options: [
        { name: 'Standard', callback: () => this.standardExportProbatesList() },
        { name: 'Advanced Export', callback: () => this.advancedExportProbatesList() },
        { name: 'Generate Firm Update', callback: () => this.generateFirmUpdate() },
        { name: 'Probate Packet Tracking', callback: () => this.generateExportPendingPacketRequests() },
      ],
    },
    exporting: { hidden: () => !this.isExporting },
  };

  public gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'Project ID',
        field: 'client.project.id',
        colId: 'client.caseId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 200,
      },
      {
        headerName: 'Project',
        field: 'client.project.name',
        colId: 'client.case.name',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.projectsWithProbates$, searchable: true, callback: this.getProjectsWithProbates.bind(this) }, 'agTextColumnFilter'),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 200,
      },
      {
        headerName: 'Project Code',
        field: 'client.project.projectCode',
        colId: 'client.case.projectCode',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.projectsCodesWithProbates$, searchable: true, callback: this.getProjectsCodesWithProbates.bind(this) }, 'agTextColumnFilter'),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 200,
      },
      {
        headerName: 'Release ID',
        field: 'releaseId',
        colId: 'releaseId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 200,
      },
      {
        headerName: 'Client ID',
        field: 'clientId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
        maxWidth: 100,
      },
      {
        headerName: 'First Name',
        field: 'client.firstName',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'client.lastName',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Probate Service Type',
        field: 'product.name',
        colId: 'product.id',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.probateServiceTypes }),
        minWidth: 170,
      },
      {
        headerName: 'Probate Stage',
        field: 'stage.name',
        colId: 'stage.id',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.probateStages }),
      },
      {
        headerName: 'Invoice Amount',
        field: 'invoiceAmount',
        colId: 'fee',
        sortable: true,
        cellRenderer: data => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true, useDashAsAnEmptyValue: true }),
      },
      {
        headerName: 'Allocation Amount',
        field: 'allocationAmount',
        colId: 'allocation',
        sortable: true,
        cellRenderer: data => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true, useDashAsAnEmptyValue: true }),
      },
      {
        headerName: 'Assigned To',
        field: 'assignedUser.displayName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Primary Firm',
        field: 'client.org.name',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Local Counsel',
        field: 'localCounselContacts',
        valueGetter: (params: ValueGetterParams) => {
          const { localCounselContacts } = params.data;
          const [firstName, ...otherNames] = this.getCounselNames(localCounselContacts || []);

          return otherNames.length
            ? `${firstName}...`
            : firstName || '';
        },
        tooltipComponent: 'htmlTooltip',
        tooltipValueGetter: (params: ITooltipParams) => {
          const { localCounselContacts } = params.data;
          const contacts = this.getCounselNames(localCounselContacts || []);

          return contacts.length > 1
            ? contacts.join(', ')
            : '';
        },
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Private Counsel',
        field: 'privateCounselContacts',
        valueGetter: (params: ValueGetterParams) => {
          const { privateCounselContacts } = params.data;
          const [firstName, ...otherNames] = this.getCounselNames(privateCounselContacts || []);

          return otherNames.length
            ? `${firstName}...`
            : firstName || '';
        },
        tooltipComponent: 'htmlTooltip',
        tooltipValueGetter: (params: ITooltipParams) => {
          const { privateCounselContacts } = params.data;
          const contacts = this.getCounselNames(privateCounselContacts || []);

          return contacts.length > 1
            ? contacts.join(', ')
            : '';
        },
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'status.name',
        colId: 'status.id',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({
          defaultValue: StatusEnum.ProbateActive,
          options: [
            {
              id: StatusEnum.ProbateActive,
              name: 'Active',
            },
            {
              id: StatusEnum.ProbateInactive,
              name: 'Inactive',
            },
          ],
        }),
      },
      {
        headerName: 'Next Follow Up Date',
        field: 'dateNextFollowUp',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        minWidth: 170,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        suppressSizeToFit: true,
        resizable: true,
        width: 180,
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: ProjectActionPanelCellRendererComponent,
      valueWithTooltip: ValueWithTooltipRendererComponent,
      htmlTooltip: HtmlTooltipRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public searchFields: SearchField[] = [
    SearchField.numberIdentifier('clientId', 'Client ID', ValidationService.onlyNumbersValidator, SearchConditionsEnum.Equals, [SearchConditionsEnum.Contains, SearchConditionsEnum.StartsWith, SearchConditionsEnum.EndsWith, SearchConditionsEnum.NotContains]),
    SearchField.text('client.attorneyReferenceId', 'Attorney Ref ID'),
    SearchField.text('client.firstName', 'Client First Name'),
    SearchField.text('client.case.name', 'Project'),
    SearchField.numberIdentifier('client.case.id', 'Project ID', ValidationService.onlyNumbersValidator, SearchConditionsEnum.Equals, [SearchConditionsEnum.Contains, SearchConditionsEnum.StartsWith, SearchConditionsEnum.EndsWith, SearchConditionsEnum.NotContains]),
    SearchField.text('client.lastName', 'Client Last  Name'),
    SearchField.text('client.org.id', 'Primary Firm Org ID'),
    SearchField.text('client.org.name', 'Primary Firm Name'),
    SearchField.number('client.ssn', 'SSN', ValidationService.onlyNumbersValidator),
    SearchField.data('product.id', 'Probate Service Type', 'id', 'name', null, [SearchConditionsEnum.IsMissing, SearchConditionsEnum.Contains], null, this.probateServiceTypes$),
    SearchField.data('stage.id', 'Probate Stage', 'id', 'name', null, [SearchConditionsEnum.IsMissing], null, this.probateStages$),
    SearchField.text('assignedUser.displayName', 'Assigned To'),
    SearchField.boolean('deathCertificateReceived', 'Death Certificate Received'),
    SearchField.text('releaseId', 'Release ID'),
    SearchField.boolean('willProbated', 'Will Probated'),
    SearchField.boolean('decendentHaveAWill', 'Decedent Has a Will'),
    SearchField.boolean('estateOpened', 'Estate Opened'),
    SearchField.text('localCounselContact.person.fullName', 'Local Counsel'),
    SearchField.date('client.dod', 'Date of Death'),
    SearchField.text('stateOfResidence', 'State Of Residence'),
    SearchField.boolean('newlyDeceased', 'Newly Deceased'),
    SearchField.number('allocation', 'Allocation Amount', ValidationService.onlyCurrencyValidator),
    SearchField.text('county', 'County'),
    SearchField.date('dateSentToProbateDept', 'Date Sent to Probate'),
    SearchField.date('dateAssigned', 'Date Assigned'),
    SearchField.date('dateAllocationReceived', 'Date Allocation Received'),
    SearchField.date('dateNextFollowUp', 'Next Follow Up Date'),
    SearchField.date('dateCompleted', 'Date Completed'),
    SearchField.boolean('paymentCleared', 'Ready for Payment'),
    SearchField.text('disbursementGroup.Name', 'Disbursement Group'),
    SearchField.boolean('invoiced', 'Invoiced'),
    SearchField.date('invoicedDate', 'Invoice Date'),
    SearchField.number('fee', 'Invoice Amount', ValidationService.onlyCurrencyValidator, [SearchConditionsEnum.IsMissing]),
    SearchField.number('invoiceNumber', 'Invoice Number', ValidationService.onlyNumbersValidator),
    SearchField.boolean('isCsSignatureRequired', 'CS Signature Required'),
    SearchField.text('nameOnCheck', 'Payee'),
    SearchField.text('status.name', 'Status'),
    SearchField.text('client.case.projectCode', 'Project Code'),
    SearchField.text('client.clientContact.person.firstName', 'Contact First Name'),
    SearchField.text('client.clientContact.person.lastName', 'Contact Last Name'),
    SearchField.text('client.clientContact.person.emailAddress', 'Contact Email'),
    SearchField.data('client.clientContact.relationshipType.id', 'Contact Relationship', 'id', 'name', null, [SearchConditionsEnum.IsMissing], null, this.relationshipTypes$),
    SearchField.data('client.clientContact.representativeType.id', 'Contact Role', 'id', 'name', null, [SearchConditionsEnum.IsMissing], null, this.representativeTypes$),
    SearchField.none('followUpDue', 'Follow Up Due', null),
  ];

  private readonly exportOrder: string[] = [
    'Project ID',
    'Project',
    'Project Code',
    'Release ID',
    'Client ID',
    'First Name',
    'Last Name',
    'Probate Service Type',
    'Probate Stage',
    'Invoice Amount',
    'Allocation Amount',
    'Assigned To',
    'Primary Firm',
    'Local Counsel',
    'Status',
    'Next Follow Up Date',
    'Last Modified Date',
  ];

  private readonly exportOrderForGenerateFirmUpdate: ColumnExport[] = [
    { name: 'Release ID', field: 'releaseId' },
    { name: 'Client ID', field: 'clientId' },
    { name: 'Client Name', field: 'client.fullName' },
    { name: 'Probate Status', field: 'stage.name' },
    { name: 'Project Name', field: 'client.case.name' },
    { name: 'Allocation Amount', field: 'allocation' },
    { name: 'Probate Service Type', field: 'product.name' },
    { name: 'Note', field: 'note' },
  ];

  private readonly exportOrderForPendingPacket: ColumnExport[] = [
    { name: 'ID', field: 'id' },
    { name: 'Project Name', field: 'projectName' },
    { name: 'Client ID', field: 'clientContact.clientId' },
    { name: 'Release ID', field: 'releaseId' },
    { name: 'Claimant Name', field: 'clientName' },
    { name: 'Claimant SSN', field: 'clientSsn' },
    { name: 'Packet Recipient', field: 'clientContact.person.fullName' },
    { name: 'Address', field: 'address' },
    { name: 'Status', field: 'status.name' },
    { name: 'Docs to Send', field: 'packetRequestToProbateDocsToSends' },
    { name: 'Missing Docs', field: 'packetRequestToProbateMissingDocs' },
    { name: 'Date Requested', field: 'dateRequested' },
    { name: 'Date Mailed', field: 'dateMailed' },
    { name: 'Date Received', field: 'dateReceived' },
    { name: 'Tracking No', field: 'trackingNo' },
    { name: 'Track Packet ', field: 'trackPacket' },
    { name: 'Notes', field: 'notes' },
  ];

  constructor(
    router: Router,
    elementRef: ElementRef,
    store: Store<AppState>,
    modalService: ModalService,
    messageService: MessageService,
    route: ActivatedRoute,
    private readonly datePipe: DateFormatPipe,
    private readonly actionsSubj: ActionsSubject,
    private readonly pusher: PusherService,
    permissionService: PermissionService,
  ) {
    super(store, modalService, messageService, route, elementRef, router, permissionService);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(ShowSavedSearchListByEntityType({ value: true }));
    this.store.dispatch(probateActions.UpdateProbatesListActionBar({ actionBar: this.actionBar }));
    this.store.dispatch(probateActions.GetProjectsWithProbates({ searchTerm: '' }));
    this.store.dispatch(probateActions.GetProjectsCodesWithProbates({ searchTerm: '' }));
    this.store.dispatch(GetSavedSearchListByEntityType({ entityType: EntityTypeEnum.Probates }));
    this.store.dispatch(claimantDetailsActions.GetProductTypesList({ productCategoryId: ProductCategory.ProbateService }));
    this.store.dispatch(claimantDetailsActions.GetProbateStages());
    this.store.dispatch(probateActions.GetPacketRequestsStages());

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(probateActions.DownloadProbatesComplete),
    ).subscribe(() => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
      this.store.dispatch(probateActions.UpdateProbatesListActionBar({ actionBar: this.actionBar }));
    });

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

    this.filtersCleared.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.onFiltersCleared();
    });

    this.subscribeOnDropdownItems();

    this.packetRequestsStages$
      .pipe(filter(stages => !!stages))
      .subscribe(stages => {
        this.packetRequestsStages = stages;
      });
  }

  private subscribeOnDropdownItems() {
    this.probateServiceTypes$.pipe(
      filter(probateServiceTypes => !!probateServiceTypes),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((probateServiceTypes: IdValue[]) => {
      this.probateServiceTypes.splice(0);
      this.probateServiceTypes.push(...probateServiceTypes);
    });
    this.probateStages$.pipe(
      filter(probateStages => !!probateStages),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((probateStages: IdValue[]) => {
      this.probateStages.splice(0);
      this.probateStages.push(...probateStages);
    });
  }

  private getCounselNames(counselContacts: PersonContact[]) {
    return counselContacts
      ? counselContacts.map(contact => `${contact.person.firstName} ${contact.person.lastName}`)
      : [];
  }

  public getProjectsWithProbates(searchTerm: string) {
    this.store.dispatch(probateActions.GetProjectsWithProbates({ searchTerm }));
  }

  public getProjectsCodesWithProbates(searchTerm: string) {
    this.store.dispatch(probateActions.GetProjectsCodesWithProbates({ searchTerm }));
  }

  protected fetchData(params): void {
    // eslint-disable-next-line no-param-reassign
    params = this.mergeSearchFilters(params);
    this.gridParams = params;
    this.store.dispatch(
      probateActions.GetProbatesList({ probatesGridParams: this.gridParams }),
    );
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);
    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  private getExportedColumns() {
    const columnsParam = this.getExportColumns().map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: this.exportFieldValueColumns.has(item.colId) ? item.field : (item.colId || item.field),
      };
      return container;
    });
    columnsParam.sort((a, b) => this.exportOrder.indexOf(a.name) - this.exportOrder.indexOf(b.name));
    return columnsParam;
  }

  private standardExportProbatesList(): void {
    const exportedColumns = this.getExportedColumns();
    this.exportRequest(exportedColumns);
  }

  private generateFirmUpdate(): void {
    const initialState = {
      title: 'Generate Firm Update',
      saveHandler: (data: IGenerateFirmUpdateModalData) => {
        const channelName = this.generateChannelName(JobNameEnum.ProbatesGenerateFirmUpdate);

        this.channel = this.pusher.subscribeChannel(
          channelName,
          Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
          this.exportProbatesListCallback.bind(this),
          () => {
            this.store.dispatch(probateActions.EnqueueGenerateFirmUpdate({
              columns: this.exportOrderForGenerateFirmUpdate,
              channelName,
              projectId: data.projectId,
            }));
            this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
            this.store.dispatch(probateActions.UpdateProbatesListActionBar({ actionBar: this.actionBar }));
          },
        );
      },
    };

    this.modalService.show(GenerateFirmUpdateModalComponent, { initialState });
  }

  private generateExportPendingPacketRequests(): void {
    const initialState = {
      title: 'Export Probate Packet Requests',
      stages: this.packetRequestsStages,
      saveHandler: (data: IExportPendingPacketRequestsModalData) => {
        const channelName = this.generateChannelName(JobNameEnum.ExportPendingPacketRequests);

        this.channel = this.pusher.subscribeChannel(
          channelName,
          Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
          this.exportProbatesListCallback.bind(this),
          () => {
            this.store.dispatch(probateActions.ExportPendingPacketRequests({
              columns: this.exportOrderForPendingPacket,
              channelName,
              statusesIds: data.statusesIds,
            }));
            this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
            this.store.dispatch(probateActions.UpdateProbatesListActionBar({ actionBar: this.actionBar }));
          },
        );
      },
    };

    this.modalService.show(ExportPendingPacketRequestsModalComponent, { initialState });
  }

  private advancedExportProbatesList() {
    this.exportRequest(this.advancedExportColumns);
  }

  private exportRequest(exportColumns: ColumnExport[]): void {
    const params = this.getExportParams();

    const channelName = this.generateChannelName(JobNameEnum.ProbatesExport);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
      this.exportProbatesListCallback.bind(this),
      () => {
        this.store.dispatch(probateActions.DownloadProbates({
          searchOptions: params.request,
          columns: exportColumns,
          channelName,
        }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.store.dispatch(probateActions.UpdateProbatesListActionBar({ actionBar: this.actionBar }));
      },
    );
  }

  private generateChannelName(jobName: JobNameEnum) {
    const channelName = StringHelper.generateChannelName(jobName);

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
    return channelName;
  }

  private exportProbatesListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.store.dispatch(probateActions.UpdateProbatesListActionBar({ actionBar: this.actionBar }));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(probateActions.DownloadProbatesDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(probateActions.Error({ error: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  public advancedExportColumns: ColumnExport[] = [
    { name: 'Project ID', field: 'client.caseId' },
    { name: 'Project', field: 'client.case.name' },
    { name: 'Project Code', field: 'client.case.projectCode' },
    { name: 'Client ID', field: 'client.id' },
    { name: 'Attorney Ref ID', field: 'client.attorneyReferenceId' },
    { name: 'Release ID', field: 'releaseId' },
    { name: 'Client First Name', field: 'client.firstName' },
    { name: 'Client Last  Name', field: 'client.lastName' },
    { name: 'Primary Firm Org ID', field: 'client.org.id' },
    { name: 'SSN', field: 'client.ssn' },
    { name: 'Probate Service Type', field: 'product.name' },
    { name: 'Probate Stage', field: 'stage.name' },
    { name: 'Assigned To', field: 'assignedUser.displayName' },
    { name: 'Death Certificate Received', field: 'deathCertificateReceived' },
    { name: 'Decedent Has a Will', field: 'decendentHaveAWill' },
    { name: 'Will Probated', field: 'willProbated' },
    { name: 'Estate Opened', field: 'estateOpened' },
    { name: 'Local Counsel', field: 'localCounselContact.person.fullName' },
    { name: 'Date of Death', field: 'client.dod' },
    { name: 'State Of Residence', field: 'stateOfResidence' },
    { name: 'Newly Deceased', field: 'newlyDeceased' },
    { name: 'Allocation Amount', field: 'allocation' },
    { name: 'County', field: 'county' },
    { name: 'Date Sent to Probate', field: 'dateSentToProbateDept' },
    { name: 'Date Assigned', field: 'dateAssigned' },
    { name: 'Date Allocation Received', field: 'dateAllocationReceived' },
    { name: 'Status', field: 'status.name' },
    { name: 'Inactive Reason', field: 'inactiveReason.name' },
    { name: 'Inactive Date', field: 'inactiveDate' },
    { name: 'Next Follow Up Date', field: 'dateNextFollowUp' },
    { name: 'Date Completed', field: 'dateCompleted' },
    { name: 'Ready for Payment', field: 'paymentCleared' },
    { name: 'Disbursement Group', field: 'disbursementGroup.Name' },
    { name: 'Invoiced', field: 'invoiced' },
    { name: 'Invoice Date', field: 'invoicedDate' },
    { name: 'Invoice Amount', field: 'fee' },
    { name: 'Invoice Number', field: 'invoiceNumber' },
    { name: 'Notes', field: 'note' },
    { name: 'Contact First Name', field: 'primaryRepContact.person.firstName' },
    { name: 'Contact Last Name', field: 'primaryRepContact.person.lastName' },
    { name: 'Contact Is Primary', field: 'primaryRepContact.isPrimaryContact' },
    { name: 'Contact Relationship', field: 'primaryRepContact.relationshipType.name' },
    { name: 'Contact Role', field: 'primaryRepContact.representativeType.name' },
    { name: 'Contact Email', field: 'primaryRepContact.person.primaryEmail.email' },
    { name: 'Contact Phone Number', field: 'primaryRepContact.person.primaryPhone.number' },
    { name: 'Contact Address1', field: 'primaryRepContact.person.primaryAddress.lineOne' },
    { name: 'Contact Address2', field: 'primaryRepContact.person.primaryAddress.lineTwo' },
    { name: 'Contact City', field: 'primaryRepContact.person.primaryAddress.city' },
    { name: 'Contact State', field: 'primaryRepContact.person.primaryAddress.state' },
    { name: 'Contact Zip', field: 'primaryRepContact.person.primaryAddress.zipCode' },
    { name: 'Contact CS Signature Required', field: 'primaryRepContact.isCsSignatureRequired' },
    { name: 'Contact Name On Check', field: 'primaryRepContact.nameOnCheck' },
  ];

  private getExportColumns(): ColDef[] {
    return this.gridOptions.columnDefs.filter(col => this.exportOrder.includes(col.headerName));
  }

  protected saveAdvancedSearch() {
    if (!this.isSearchSaved) {
      this.store.dispatch(probateActions.SaveSearchParams({ items: this.searchState }));
    }
  }

  protected toggleAdvancedSearch() {
    super.toggleAdvancedSearch();
    this.store.dispatch(probateActions.SaveAdvancedSearchVisibility({ isVisible: this.showAdvancedSearch }));
  }

  public setAdvancedSearchVisible(isVisible: boolean): void {
    this.store.dispatch(probateActions.SaveAdvancedSearchVisibility({ isVisible }));
    this.showAdvancedSearch = isVisible;
  }

  protected onRowDoubleClicked({ data }): void {
    if (!this.permissionService.canRead(PermissionTypeEnum.ProbateDetails)) {
      return;
    }
    const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
    this.store.dispatch(
      CreatePager({
        relatedPage: RelatedPage.ProbateSearch,
        settings: navSettings,
      }),
    );

    const claimantDetailsRequest: ClaimantDetailsRequest = { gridParamsRequest: this.gridParams.request };
    this.store.dispatch(claimantDetailsActions.SetClaimantDetailsRequest({ claimantDetailsRequest }));
    this.store.dispatch(probateActions.GoToProbateDetails({ clientId: data.clientId }));
  }

  private onFiltersCleared() {
    this.store.dispatch(probateActions.GoToProbatesListPage());
    this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(ShowSavedSearchListByEntityType({ value: false }));
  }
}
