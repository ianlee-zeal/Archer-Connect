import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers';
import { GridId, PermissionActionTypeEnum, PermissionTypeEnum, StatusEnum } from '@app/models/enums';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { DocumentBatchState } from '../state/reducer';
import * as documentBatchActions from '../state/actions';
import * as selectors from '../state/selectors';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { PermissionService } from '@app/services';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import * as actions from '@app/modules/document-batch/state/actions';
import { ProjectActionPanelCellRendererComponent } from '@app/modules/projects/project-action-panel-cell-renderer/project-action-panel-cell-renderer.component';
import { ValueWithTooltipRendererComponent } from '@app/modules/shared/_renderers';
import { filter, takeUntil } from 'rxjs/operators';
import { IdValue } from '@app/models';

@Component({
  selector: 'app-document-batch-list-view',
  templateUrl: './document-batch-list-view.component.html',
  styleUrls: ['./document-batch-list-view.component.scss']
})
export class DocumentBatchListViewComponent extends ListView implements OnInit, OnDestroy {

  public statusTypes$ = this.store.select(selectors.statusTypes);
  statusTypes: SelectOption[] = [];
  documentBatchUploadSettings$ = this.store.select(selectors.documentBatchUploadSettings);
  selectedDepartmentOptions: IdValue[] = [];

  public readonly gridId: GridId = GridId.DocumentBatchListView;
  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        sortable: true,
        sort: 'desc',
        ...AGGridHelper.numberColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Project',
        field: 'caseName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 200,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateColumnFilter(),
        ...AGGridHelper.dateTimeColumnDefaultParams,
      },
      {
        headerName: 'Created By',
        field: 'createdByFullName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'File Count',
        field: 'numberOfDocumentsInBatch',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.numberColumnDefaultParams,
      },
      /* Commenting out for now because this may be added back later.
      {
        headerName: 'Status',
        field: 'statusName',
        colId: 'statusId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.statusTypes }),
      },
      */
      {
        headerName: 'Departments',
        field: 'departmentIdsCsv',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.selectedDepartmentOptions }),
        minWidth: 200,
        valueGetter(params) {
          const departmentNames: string = params.data.departmentNames.join(', ');
          if (!departmentNames) {
            return '';
          } else {
            return departmentNames.length > 50 ? departmentNames.substring(0, 50) + '...' : departmentNames;
          }
        },
        tooltipValueGetter(params) {
          return params.data.departmentNames.join(', ');
        },
      },
      {
        headerName: 'Status',
        field: 'ticketStatusName',
        colId: 'ticketStatusId',
        sortable: true,
        tooltipValueGetter: () => 'Status is updated daily.',
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: StatusEnum.TicketStatusPending,
              name: 'Pending',
            },
            {
              id: StatusEnum.TicketStatusReceived,
              name: 'Received',
            },
          ],
        }),
      },
      {
        headerName: 'Batch Notes',
        field: 'batchDescription',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        valueGetter(params) {
          const batchDescription: string = params.data.batchDescription;
          return batchDescription.length > 50 ? batchDescription.substring(0, 50) + '...' : batchDescription;
        },
        tooltipValueGetter(params) {
          return params.data.batchDescription;
        },
      },
      //AGGridHelper.getActionsColumn({ editProjectHandler: this.onRowDoubleClicked.bind(this) }, 120, true), // Commenting out for now because this may be added back later.
    ],
    components: {
      buttonRenderer: ProjectActionPanelCellRendererComponent,
      valueWithTooltip: ValueWithTooltipRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    protected router: Router,
    private datePipe: DateFormatPipe,
    protected elementRef: ElementRef,
    private store: Store<DocumentBatchState>,
    private permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.store.dispatch(documentBatchActions.getStatusTypes());
    this.store.dispatch(documentBatchActions.getDocumentBatchUploadSettings());
    this.subscribeToStatusTypes();
    this.subscribeToDepartments();
  }

  public actionBarActionHandlers: ActionHandlersMap = {
    new: {
      callback: () => this.newBatch(),
      permissions: PermissionService.create(PermissionTypeEnum.DocumentBatch, PermissionActionTypeEnum.Create),
    },
  };

  protected fetchData(agGridParams) {
    this.store.dispatch(documentBatchActions.searchBatches({ agGridParams }));
  }

  private newBatch(): void {
    this.router.navigate(['/document-batches/upload']);
  }

  subscribeToStatusTypes(): void {
    this.statusTypes$
      .pipe(
        filter(statusTypes => !!statusTypes),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(statusTypes => {
        this.statusTypes.splice(0);
        this.statusTypes.push(...statusTypes);
      });
  }

  subscribeToDepartments(): void {
    this.documentBatchUploadSettings$
      .pipe(
        filter(settings => !!settings && !!settings.departments && settings.departments.length > 0),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(settings => {
        this.selectedDepartmentOptions.push(new IdValue(0, 'None'));
        this.selectedDepartmentOptions.push(...settings.departments);
        if (this.gridApi) {
          this.gridApi.onFilterChanged();
          this.gridApi.refreshHeader();
        }
      });
  }

  protected onRowDoubleClicked({ data }): void {
    const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
    this.store.dispatch(
      CreatePager({
        relatedPage: RelatedPage.BatchDetails,
        settings: navSettings,
      }),
    );

    setTimeout(() => {
      this.store.dispatch(actions.GoToBatchDetails({ batchId: data.id, navSettings }));
    }, 0);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
