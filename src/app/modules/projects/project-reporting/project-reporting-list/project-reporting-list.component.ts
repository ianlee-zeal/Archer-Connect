import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers';
import { DeficienciesButtonsRendererComponent } from '@app/modules/shared/deficiencies-list-base/deficiencies-buttons-renderer/deficiencies-buttons-renderer.component';
import { TextWithIconRendererComponent } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { AppState } from '../../state';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ModalService, PermissionService } from '@app/services';
import { ScheduleReportModalComponent } from '../schedule-report-modal/schedule-report-modal.component';
import { IntegrationStatus, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { filter, first, takeUntil } from 'rxjs';

@Component({
  selector: 'app-project-reporting-list',
  templateUrl: './project-reporting-list.component.html'
})
export class ProjectReportingListComponent extends ListView implements OnInit, OnDestroy {

  private projectId: number;

  public gridId: GridId = GridId.ProjectReporting;
  public readonly currentProject$ = this.store.select(selectors.item);
  readonly actionBar$ = this.store.select(selectors.actionBar);

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Report',
        field: 'integrationTypeName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Frequency',
        colId: 'frequencyId',
        field: 'frequencyName',
        sortable: true,
        width: 130,
        minWidth: 130,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.getFrequencyOptions() }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Schedule',
        field: 'cronDescription',
        sortable: false,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Automation Enabled?',
        field: 'automationEnabled',
        sortable: true,
        width: 160,
        minWidth: 160,
        cellRenderer: (data: { value: boolean; }) => {
          return data.value ? 'Yes' : 'No';
        },
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'Recipients',
        field: 'recipientsCount',
        sortable: true,
        width: 120,
        minWidth: 120,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Last Run Date',
        field: 'lastRunDate',
        sortable: true,
        resizable: false,
        width: 200,
        minWidth: 200,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateOnlyColumnFilter(),
      },
      {
        headerName: 'Run Status',
        colId: 'statusId',
        field: 'statusName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.getStatusOptions() }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedByUserName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        resizable: false,
        width: 200,
        minWidth: 200,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateOnlyColumnFilter(),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: DeficienciesButtonsRendererComponent,
      textWithIconRenderer: TextWithIconRendererComponent,
      linkActionRenderer: LinkActionRendererComponent,
    },
    onRowDoubleClicked: ({data}) => this.navigateToScheduleReportDetails(data.id),
  };

  constructor(
    protected readonly store: Store<AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    protected readonly datePipe: DateFormatPipe,
    protected readonly modalService: ModalService,
    private route: ActivatedRoute,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.actionBar$.pipe(first())
      .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(actions.UpdateActionBar({ actionBar: {
        ...actionBar,
        new: {
          callback: () => this.addNew(),
          permissions: PermissionService.create(PermissionTypeEnum.ReportSettings, PermissionActionTypeEnum.Create),
        },
        clearFilter: this.clearFilterAction(),
      } })));

    this.currentProject$
      .pipe(filter(item => !!item), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.projectId = item.id;
      });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.store.dispatch(actions.GetReportScheduleList({ params }));
  }

  private getStatusOptions(): SelectOption[] {
    return [
      { id: IntegrationStatus.Failed, name: 'Failed' },
      { id: IntegrationStatus.Completed, name: 'Completed' },
      { id: IntegrationStatus.Processing, name: 'Processing' },
      { id: IntegrationStatus.Scheduled, name: 'Scheduled' },
      { id: IntegrationStatus.Started, name: 'Started' }
    ];
  }

  private getFrequencyOptions(): SelectOption[] {
    return [
      { id: 1, name: 'Weekly' },
      { id: 2, name: 'Monthly' }
    ];
  }

  protected addNew(): void {
    this.modalService.show(ScheduleReportModalComponent, { initialState: { projectId: this.projectId }});
  }

  private navigateToScheduleReportDetails(id: number): void {
    this.router.navigate([id], { relativeTo: this.route });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
  }

}
