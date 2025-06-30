/* eslint-disable no-restricted-globals */
import { Component, OnInit, ElementRef } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { ofType } from '@ngrx/effects';
import { GridOptions, ColDef } from 'ag-grid-community';
import * as fromRoot from '@app/state';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DateFormatPipe, EnumToArrayPipe, PhoneNumberPipe, SsnPipe } from '@shared/_pipes';
import { filter, takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { ModalService } from '@app/services/modal.service';
import { AdvancedSearchListView } from '@app/modules/shared/_abstractions/advanced-search-list-view';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { SearchField } from '@app/models/advanced-search/search-field';

import * as fromAuth from '@app/modules/auth/state';

import { SearchConditionsEnum as SC } from '@app/models/advanced-search/search-conditions.enum';
import { ValidationService as VS } from '@app/services/validation.service';
import { IdValue } from '@app/models/idValue';
import { exportsSelectors } from '@shared/state/exports/selectors';
import { ColumnExport } from '@app/models/column-export';
import { PusherService } from '@app/services/pusher.service';
import { SearchState } from '@app/models/advanced-search/search-state';
import { ExportLoadingStatus, DefaultGlobalSearchType, PermissionActionTypeEnum, PermissionTypeEnum, EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { PermissionService } from '@app/services';
import { GridId } from '@app/models/enums/grid-id.enum';
import { StringHelper } from '@app/helpers';
import * as exportsActions from '@shared/state/exports/actions';
import { PersonsAddComponent } from '../persons-add/persons-add.component';
import { selectors, actions } from '../state';
import { MessageService } from '../../../../services/message.service';
import { AppState } from '../../../shared/state';

import * as personActions from '../state/actions';

@Component({
  selector: 'app-persons-list',
  templateUrl: './persons-list.component.html',
  styleUrls: ['./persons-list.component.scss'],
})
export class PersonsListComponent extends AdvancedSearchListView implements OnInit {
  public readonly gridId: GridId = GridId.Persons;
  entityType: EntityTypeEnum = EntityTypeEnum.Persons;
  public advancedSearch$ = this.store.select(selectors.advancedSearch);

  public maritalStatuses$ = this.store.select(fromRoot.maritalStatusesDropdownValues);

  public gender$ = this.store.select(fromRoot.genderDropdownValues);

  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);

  public error$ = this.store.select(selectors.error);

  public maritalStatuses: IdValue[] = [];

  public bsModalRef: BsModalRef;

  private timezone: string;

  public gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    columnDefs: [
      {
        headerName: 'Person ID',
        field: 'id',
        width: 50,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'Middle Name',
        field: 'middleName',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        resizable: true,
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Organization',
        field: 'organization.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 120,
      },
      {
        headerName: 'SSN',
        field: 'cleanSsn',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ stripDashes: true }),
        cellRenderer: data => this.ssnPipe.transform(data.value),
        ...AGGridHelper.ssnColumnDefaultParams,
      },
      {
        headerName: 'Date of Birth',
        field: 'dateOfBirth',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Gender',
        field: 'gender',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Marital Status',
        field: 'maritalStatus.name',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, this.timezone, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
    ],
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public additionalColDefs: ColDef[] = [
    {
      headerName: 'Email',
      field: 'primaryEmail.email',
      colId: 'emails.emailValue',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.emailColumnDefaultParams,
    },
    {
      headerName: 'Address Line 1',
      field: 'primaryAddress.lineOne',
      colId: 'primaryAddress.lineOne',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'City',
      field: 'primaryAddress.city',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'State',
      field: 'primaryAddress.state',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Zip Code',
      field: 'primaryAddress.zipCode',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.nameColumnDefaultParams,
    },
    {
      headerName: 'Phone Number',
      field: 'primaryPhone.number',
      colId: 'phones.number',
      cellRenderer: data => this.phoneNumberPipe.transform(data.value),
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter({ stripDashes: true }),
      ...AGGridHelper.phoneColumnDefaultParams,
    },
    {
      headerName: 'Date of Death',
      field: 'dateOfDeath',
      sortable: true,
      cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
      ...AGGridHelper.dateColumnDefaultParams,
      ...AGGridHelper.dateColumnFilter(),
    },
    {
      headerName: 'Prefix',
      field: 'prefix',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.emailColumnDefaultParams,
    },
    {
      headerName: 'Suffix',
      field: 'suffix',
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter(),
      ...AGGridHelper.emailColumnDefaultParams,
    },
  ];

  public searchFields: SearchField[] = [
    SearchField.numberIdentifier('id', 'Person ID', VS.onlyNumbersValidator, SC.Equals, [SC.Contains, SC.StartsWith, SC.EndsWith, SC.NotContains]),
    SearchField.text('firstName', 'First Name', null, null, [SC.IsMissing]),
    SearchField.text('middleName', 'Middle Name', null, null, [SC.IsMissing]),
    SearchField.text('lastName', 'Last Name', null, null, [SC.IsMissing]),
    SearchField.text('emails.emailValue', 'Email Address', VS.emailValidator, null, [SC.IsMissing], [SC.Equals, SC.NotEqual]),
    SearchField.text('cleanSsn', 'SSN', null, null, [SC.IsMissing], null, StringHelper.stripDashes),
    SearchField.date('dateOfBirth', 'Date of Birth', true, [SC.IsMissing]),
    SearchField.data('gender', 'Gender', 'id', 'name', null, [SC.IsMissing, SC.Contains], null, this.gender$),
    SearchField.data('maritalStatus.id', 'Marital Status', 'id', 'name', null, [SC.IsMissing, SC.Contains], null, this.maritalStatuses$),
    SearchField.text('primaryAddress.lineOne', 'Street', null, null, [SC.IsMissing]),
    SearchField.text('primaryAddress.city', 'City', null, null, [SC.IsMissing]),
    SearchField.text('primaryAddress.state', 'State', null, null, [SC.IsMissing]),
    SearchField.text('primaryAddress.zipCode', 'Zip Code', VS.zipCodePartialValidator, null, [SC.IsMissing]),
    SearchField.text('phones.number', 'Phone Number', null, null, [SC.IsMissing], null, StringHelper.stripDashes),
    SearchField.date('dateOfDeath', 'Date of Death', true, [SC.IsMissing]),
    SearchField.date('lastModifiedDate', 'Last Modified Date', null, [SC.IsMissing]),
    SearchField.text('lastModifiedBy.displayName', 'Last Modified By', null, null, [SC.IsMissing]),
  ];

  public actionBarActionHandlers: ActionHandlersMap = {
    new: {
      callback: () => this.onAdd(),
      permissions: PermissionService.create(PermissionTypeEnum.Persons, PermissionActionTypeEnum.Create),
    },
    download: {
      disabled: () => !this.canClearFilters() || this.isExporting || (SearchState.hasErrors(this.searchState) && this.showAdvancedSearch),
      options: [
        { name: 'Standard', callback: () => this.exportPersonsList(this.getAllColumnDefs()) },
        // { name: 'Advanced Export', callback: () => this.documentGenerationExport() },
      ],
    },
    advancedSearch: this.advancedSearchAction(),
    basicSearch: this.basicSearchAction(),
    clearFilter: this.clearFilterAction(),
    exporting: { hidden: () => !this.isExporting },
  };

  private readonly exportOrder: string[] = [
    'Person ID',
    'First Name',
    'Middle Name',
    'Last Name',
    'Organization',
    'SSN',
    'Date of Birth',
    'Date of Death',
    'Marital Status',
    'Gender',
    'Email',
    'Phone Number',
    'Address Line 1',
    'City',
    'State',
    'Zip Code',
    'Prefix',
    'Suffix',
    'Last Modified Date',
    'Last Modified By',
  ];

  public searchType = DefaultGlobalSearchType.Persons;

  constructor(
    public store: Store<AppState>,
    public modalService: ModalService,
    public messageService: MessageService,
    public route: ActivatedRoute,
    private datePipe: DateFormatPipe,
    private actionsSubj: ActionsSubject,
    protected router: Router,
    private ssnPipe: SsnPipe,
    protected elementRef: ElementRef,
    private pusher: PusherService,
    private readonly phoneNumberPipe: PhoneNumberPipe,
    private readonly enumToArray: EnumToArrayPipe,
    permissionService: PermissionService,
  ) {
    super(store, modalService, messageService, route, elementRef, router, permissionService);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.maritalStatuses$.pipe(
      filter(statuses => !!statuses),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(statuses => { this.maritalStatuses = statuses; });

    this.authStore$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.timezone = user.timezone && user.timezone.name;
    });

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(personActions.DownloadPersonsComplete),
    )
      .subscribe(() => {
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.store.dispatch(personActions.UpdatePersonsListActionBar({ actionBar: this.actionBarActionHandlers }));
      });
  }

  private exportPersonsList(columns: ColDef[]): void {
    const columnsParam = columns.map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.field,
      };
      return container;
    });
    columnsParam.sort((a, b) => this.exportOrder.indexOf(a.name) - this.exportOrder.indexOf(b.name));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportPersonsList);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.exportPersonsListCallback.bind(this),
      () => (this.store.dispatch(personActions.DownloadPersons({
        searchOptions: this.getExportParams().request,
        columns: columnsParam,
        channelName,
      }))),
    );
  }

  private exportPersonsListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.store.dispatch(personActions.UpdatePersonsListActionBar({ actionBar: this.actionBarActionHandlers }));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(personActions.DownloadPersonsDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(personActions.Error({ error: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (row) {
      const navSettings = AGGridHelper.getNavSettings(this.gridApi);
      this.store.dispatch(CreatePager({ relatedPage: RelatedPage.PersonsFromSearch, settings: navSettings }));
      this.router.navigate(
        ['dashboard', 'persons', row.id],
        { state: { navSettings } },
      );
    }
  }

  public addNewRecord(): void {
    this.onAdd();
  }

  private onAdd(): void {
    const initialState = { title: 'Create new person' };

    this.bsModalRef = this.modalService.show(PersonsAddComponent, {
      initialState,
      class: 'add-person-modal',
    });
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  protected fetchData(agGridParams): void {
    // eslint-disable-next-line no-param-reassign
    agGridParams = this.mergeSearchFilters(agGridParams);
    // Per AC-3411, disabled as not to be release with MVP. To be restored & fixed at a later point
    /* Old Code Here */
    // this.addAdditionalColumn(agGridParams);
    /* Old Code Here */

    this.gridParams = agGridParams;
    this.store.dispatch(actions.GetPersonsList({ agGridParams }));
  }

  protected saveAdvancedSearch(): void {
    this.store.dispatch(actions.SaveSearchParams({ items: this.searchState }));
  }

  protected toggleAdvancedSearch(): void {
    super.toggleAdvancedSearch();
    this.store.dispatch(actions.SaveAdvancedSearchVisibility({ isVisible: this.showAdvancedSearch }));
  }

  private getAllColumnDefs(): ColDef[] {
    return this.additionalColDefs
      ? this.gridOptions.columnDefs.filter(col => !this.additionalColDefs.find(addCol => 'field' in col && addCol.field === col.field))
        .concat(this.additionalColDefs)
      : [].concat(this.gridOptions.columnDefs);
  }
}
