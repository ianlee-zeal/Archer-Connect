import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { GridId } from '@app/models/enums/grid-id.enum';
import { MessageService, ModalService } from '@app/services';
import { AppState } from '@app/state';
import { DeficienciesListBase } from '@app/modules/shared/deficiencies-list-base/deficiencies-list-base';
import { filter, takeUntil } from 'rxjs/operators';
import { AGGridHelper } from '@app/helpers';
import { IGridActionRendererParams } from '@app/entities';
import { Deficiency } from '@app/models/deficiency';
import { DeficienciesButtonsRendererComponent } from '@app/modules/shared/deficiencies-list-base/deficiencies-buttons-renderer/deficiencies-buttons-renderer.component';
import { ObservableOptionsHelper } from '@app/helpers/observable-options.helper';
import { TextWithIconRendererComponent } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';

@Component({
  selector: 'app-claimant-deficiencies',
  templateUrl: './claimant-deficiencies.component.html',
})

export class ClaimantDeficienciesComponent extends DeficienciesListBase {
  public readonly currentClaimant$ = this.store.select(selectors.item);
  public readonly gridId: GridId = GridId.ClaimantDeficiencies;

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
        headerName: 'Entity ID',
        field: 'entityId',
        width: 75,
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
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: { clearFilter: super.clearFilterAction() } }));
    this.currentClaimant$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(claimant => {
      this.caseId = claimant.project.id;
    });
    this.store.dispatch(actions.ToggleClaimantSummaryBar({ isExpanded: true }));
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
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
  }
}
