import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { GridOptions, RowDoubleClickedEvent } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as fromAuth from '@app/modules/auth/state';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GetSavedSearch, DeleteSavedSearchByIdRequest, GetSavedSearchesGrid, ResetCurrentSearch } from '@app/modules/shared/state/saved-search/actions';
import { savedSearchSelectors } from '@app/modules/shared/state/saved-search/selectors';

import { ModalService, MessageService, SavedSearchUrlService } from '@app/services';
import { SaveSearchModalComponent } from '@app/modules/shared/advanced-search/save-search-modal/save-search-modal.component';

import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { EntityTypeEnum } from '@app/models/enums';
import { SavedSearchesRendererComponent } from '../renderers/saved-searches-buttons-renderer';
import * as fromShared from '../../shared/state';

@Component({
  selector: 'app-saved-searches-list',
  templateUrl: './saved-searches-list.component.html',
  styleUrls: ['./saved-searches-list.component.scss'],
})
export class SavedSearchesListComponent extends ListView implements OnInit, OnDestroy {
  @Input() public claimantId: number;

  public readonly gridId: GridId = GridId.SavedSearches;
  public entityType: EntityTypeEnum;

  private savedSearchService: SavedSearchUrlService;
  public readonly savedSearch$ = this.store.select(savedSearchSelectors.savedSearchList);
  public bsModalRef: BsModalRef;
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  public actionBar = { clearFilter: this.clearFilterAction() };
  public userId: number;
  public orgId: number;
  public searchTypeOptions: SelectOption[] = [
    {
      id: 1,
      name: 'Private',
    },
    {
      id: 2,
      name: 'Users',
    },
    {
      id: 3,
      name: 'My Organization',
    },
  ];
  public entityTypeOptions: SelectOption[] =
  [
    { id: EntityTypeEnum.Clients, name: 'Clients' },
    { id: EntityTypeEnum.Probates, name: 'Probates' },
    { id: EntityTypeEnum.PaymentQueues, name: 'Payment Queue' },
    { id: EntityTypeEnum.ProjectClaimantSummary, name: 'Claimant Summary List' },
    { id: EntityTypeEnum.ProjectClaimantSummaryRollup, name: 'Claimant Summary Rollup List' },
  ];

  protected ngUnsubscribe$ = new Subject<void>();
  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Search Type',
        field: 'entityType',
        colId: 'entityTypeId',
        sortable: true,
        width: 50,
        cellRenderer: data => (data.value != null ? this.entityTypeOptions.find(type => type.id === data.value)?.name : ''),
        ...AGGridHelper.getDropdownColumnFilter({ options: this.entityTypeOptions }),
      },
      {
        headerName: 'Shared With',
        colId: 'AdvancedSearchShareTypeId',
        field: 'advancedSearchType',
        sortable: true,
        width: 50,
        cellRenderer: data => (data.value != null ? this.searchTypeOptions.find(type => type.id === data.value).name : ''),
        ...AGGridHelper.getDropdownColumnFilter({ options: this.searchTypeOptions }),
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        sortable: true,
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        resizable: true,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        resizable: true,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Last Run Date',
        field: 'lastRunDate',
        colId: 'lastRunDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Run Count',
        sortable: true,
        field: 'runCount',
        width: 30,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      AGGridHelper.getActionsColumn({
        editSavedSearchHandler: this.editSavedSearch.bind(this),
        goToSavedSearchHandler: this.goToSearch.bind(this),
        deleteSavedSearchHandler: this.deleteSavedSearchByIdRequest.bind(this),
      }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { buttonRenderer: SavedSearchesRendererComponent },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    router: Router,
    elementRef: ElementRef,
    private readonly store: Store<fromShared.AppState>,
    private readonly modalService: ModalService,
    private readonly datePipe: DateFormatPipe,
    public messageService: MessageService,
    savedSearchService: SavedSearchUrlService,
  ) {
    super(router, elementRef);
    this.savedSearchService = savedSearchService;
  }

  public ngOnInit(): void {
    this.authStore$
      .pipe(
        filter(user => !!user),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(user => {
        this.userId = user.id;
        this.orgId = user.selectedOrganization.id;
      });
  }

  public goToSearch(params: any): void {
    const searchId: number = params.data.id;
    const gridId: GridId = params.data.gridId;
    const projectId = params.data.projectId;
    if (gridId) {
      const url = this.savedSearchService.getSavedSearchUrl(params.data.entityType, searchId, projectId);
      if (!!url) {
        this.router.navigate([url]);
        return;
      }
    }

  }

  public editSavedSearch(params: any): void {
    this.entityType = params.data.entityType;
    this.store.dispatch(GetSavedSearch({ id: params.data.id, entityType: params.data.entityType }));
    this.bsModalRef = this.modalService.show(SaveSearchModalComponent, {
      initialState: {
        searchId: params.data.id,
        currentSelectedOrgId: this.orgId,
        entityType: params.data.entityType,
        isEdit: true,
      },
      class: 'modal-md',
    });
  }

  public deleteSavedSearchByIdRequest(params: any): void {
    if (!params.data.id) {
      return;
    }
    this.messageService
      .showDeleteConfirmationDialog('Delete Search', 'Are you sure you want to delete this search?')
      .subscribe(answer => {
        if (!answer) {
          return;
        }

        this.store.dispatch(DeleteSavedSearchByIdRequest({ id: params.data.id, entityType: params.data.entityType }));
      });
  }

  protected fetchData(agGridParams): void {
    this.gridParams = agGridParams;
    this.store.dispatch(GetSavedSearchesGrid({ agGridParams }));
  }

  private onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    if (event && event.data) {
      this.goToSearch(event);
    }
  }

  public ngOnDestroy(): void {
    if (this.entityType) {
      this.store.dispatch(ResetCurrentSearch({ entityType: this.entityType }));
    }
    this.entityType = null;
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
