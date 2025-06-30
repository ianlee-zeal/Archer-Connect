/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { EntityTypeEnum } from '@app/models/enums';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { AppState } from '@app/state';
import { filter, first, takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as rootSelectors from '@app/state/index';
import * as commonActions from '../state/actions';
import * as actions from './state/actions';
import { LienDeficienciesGridActionsRendererComponent } from './lien-deficiencies-grid-actions-renderer/lien-deficiencies-grid-actions-renderer.component';
import * as selectors from '../state/selectors';


@Component({
  selector: 'app-lien-deficiencies-grid',
  templateUrl: './lien-deficiencies-grid.component.html',
  styleUrls: ['./lien-deficiencies-grid.component.scss'],
})

export class LienDeficienciesGridComponent extends ListView implements OnInit {
  readonly gridId: GridId = GridId.LienDeficiencies;
  public bsModalRef: BsModalRef;
  public actionbar$ = this.store.select(selectors.actionBar);

  readonly actionBar: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
  };

  private statusOpts: SelectOption[] = [];

  gridOptions: GridOptions;

  private readonly statusOpts$ = this.store.select(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.Integrations }));


  constructor(
    private readonly store: Store<AppState>,
    private readonly datePipe: DateFormatPipe,
    private actionsSubj: ActionsSubject,

    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.statusOpts$.pipe(
      filter(s => s.length && !this.statusOpts.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      this.statusOpts.push(...opts.map(o => ({ id: o.id, name: o.name })));
      this.setGrid();
    });

    this.actionbar$
    .pipe(
      first(actionBar => !!actionBar),
      takeUntil(this.ngUnsubscribe$),
    )
    .subscribe(actionBar => {
      this.store.dispatch(commonActions.UpdateActionBar({ actionBar: {...actionBar, clearFilter: this.clearFilterAction() } }));
    });


    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.RefreshLienDeficienciesGrid),
    ).subscribe(() => this.gridApi.refreshServerSide({ purge: true }));
  }

  private setGrid() {
    this.gridOptions = {
      animateRows: false,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          width: 50,
          sortable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        },
        {
          headerName: 'Status',
          field: 'status.name',
          colId: 'statusId',
          autoHeight: true,
          wrapText: true,
          sortable: true,
          ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.statusOpts }),
          maxWidth: 175,
        },
        {
          headerName: 'Created By',
          field: 'createdBy.displayName',
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.nameColumnDefaultParams,
          maxWidth: 300,
        },
        {
          headerName: 'Created Date',
          field: 'createdDate',
          sortable: true,
          sort: 'desc',
          cellRenderer: data => this.datePipe.transform(data.value, true),
          ...AGGridHelper.dateTimeColumnDefaultParams,
          ...AGGridHelper.dateColumnFilter(),
          width: 200,
        },
        {
          field: 'resultDocumentId',
          hide: true,
        },
        { ...AGGridHelper.getActionsColumn({ downloadHandler: this.onDownloadResults.bind(this) }), pinned: null },
      ],
      defaultColDef: {
        ...AGGridHelper.defaultGridOptions.defaultColDef,
        floatingFilter: true,
      },
      components: { buttonRenderer: LienDeficienciesGridActionsRendererComponent },
    };
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;

    [{ id: 'statusId', name: 'status.name' }].forEach(key => {
      const keyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === key.id);
      if (keyIndex !== -1) {
        this.gridParams.request.filterModel[keyIndex].filterType = 'number';
      }

      const colIndex = this.gridParams.request.sortModel.findIndex(i => i.colId === key.id);
      if (colIndex !== -1) {
        this.gridParams.request.sortModel[colIndex].colId = key.name;
      }
    });

    this.store.dispatch(actions.GetList({ agGridParams: this.gridParams }));
  }

  private onDownloadResults(jobId: number): void {
    this.store.dispatch(actions.DownloadDocument({ jobId }));
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
