import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DeficienciesListBase } from '@app/modules/shared/deficiencies-list-base/deficiencies-list-base';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { MessageService, ModalService } from '@app/services';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { takeUntil, filter } from 'rxjs/operators';
import { AGGridHelper } from '@app/helpers';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { IGridActionRendererParams } from '@app/entities';
import { Deficiency } from '@app/models/deficiency';
import { DeficienciesButtonsRendererComponent } from '@app/modules/shared/deficiencies-list-base/deficiencies-buttons-renderer/deficiencies-buttons-renderer.component';
import { TextWithIconRendererComponent } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import { ObservableOptionsHelper } from '@app/helpers/observable-options.helper';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { AppState } from '../state';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';

@Component({
  selector: 'app-project-deficiencies-list',
  templateUrl: './project-deficiencies-list.component.html',
})
export class ProjectDeficienciesListComponent extends DeficienciesListBase {
  public gridId: GridId = GridId.ProjectDeficiencies;
  public readonly currentProject$ = this.store.select(selectors.item);

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Deficiency ID',
        field: 'id',
        sortable: true,
        sort: 'desc',
        ...AGGridHelper.numberColumnDefaultParams,
        width: 110,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Severity',
        sortable: true,
        field: 'severity',
        cellRendererSelector: params => (
          AGGridHelper.getTextBoxWithIconRenderer({
            text: params.value,
            textFirst: true,
            faIconClass: params.value === 'Error' ? 'fa-exclamation-triangle red-color' : null,
          })
        ),
        minWidth: 100,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Status',
        field: 'status',
        sortable: true,
        colId: this.STATUS_COL_ID,
        ...AGGridHelper.numberColumnDefaultParams,
        minWidth: 70,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({
          options: ObservableOptionsHelper.getDeficiencyStatusOptions(),
        }),
      },
      {
        headerName: 'Client ID',
        field: 'clientId',
        width: 75,
        sortable: true,
        resizable: true,
        cellRendererSelector: () =>
          AGGridHelper.getLinkActionRenderer({
            onAction: this.goToClientDetails.bind(this),
            showLink: this.onShowClientLink.bind(this),
          }),
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Client Name',
        field: 'fullName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Entity ID',
        field: 'entityId',
        width: 75,
        maxWidth: 100,
        sortable: true,
        resizable: true,
        cellRendererSelector: () =>
          AGGridHelper.getLinkActionRenderer({
            onAction: this.goToEntityDetails.bind(this),
            showLink: this.onShowEntityLink.bind(this),
          }),
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Entity Type',
        field: 'entityTypeName',
        sortable: true,
        width: 150,
        minWidth: 150,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Deficiency Type',
        sortable: true,
        width: 200,
        minWidth: 200,
        field: 'deficiencyType',
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Deficiency Description',
        field: 'deficiencyTypeDescription',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 370,
        width: 370,
      },
      {
        headerName: 'Related Process',
        sortable: true,
        field: 'relatedProcess',
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Disbursement Group',
        field: 'disbursementGroupName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Responsible Party',
        sortable: true,
        field: 'responsibleParty',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        width: 130,
        minWidth: 130,
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateOnlyColumnFilter(),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Last Updated',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateOnlyColumnFilter(),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      AGGridHelper.getActionsColumn({ editHandler: this.onOverride.bind(this) } as IGridActionRendererParams<Deficiency>),
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
  };

  constructor(
    protected readonly store: Store<AppState>,
    protected readonly router: Router,
    protected messageService: MessageService,
    public readonly modalService: ModalService,
    protected readonly elementRef: ElementRef,
    protected readonly datePipe: DateFormatPipe,
  ) {
    super(router, messageService, modalService, elementRef, datePipe);
  }

  public ngOnInit() {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: { clearFilter: super.clearFilterAction() } }));
    this.currentProject$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(project => {
      this.caseId = project.id;
    });
  }

  protected onFetchData(params: IServerSideGetRowsParamsExtended) {
    this.store.dispatch(actions.GetDeficienciesList({ params }));
  }

  protected overrideDeficiency(id: number) {
    const caseId = this.caseId;
    this.store.dispatch(actions.OverrideDeficiency({ id, caseId }));
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
  }
}
