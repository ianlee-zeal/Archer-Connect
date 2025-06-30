/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridApi, GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { AppState } from '@app/state';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { IntegrationJob } from '@app/models/lien-deficiencies/integration-job';
import * as commonActions from '../state/actions';
import * as actions from './state/actions';
import { actionBar } from '../state/selectors';
import { lienDeficienciesGridSelectors } from './state/selectors';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { first, takeUntil } from 'rxjs/operators';
import { LienDeficienciesManagementGridActionsRendererComponent } from './lien-deficiencies-management-grid-actions-renderer/lien-deficiencies-management-grid-actions-renderer.component';
import { ofType } from '@ngrx/effects';
import { IdValue } from '@app/models';

@Component({
  selector: 'app-lien-deficiencies-management-grid',
  templateUrl: './lien-deficiencies-management-grid.component.html',
  styleUrls: ['./lien-deficiencies-management-grid.component.scss'],
})

export class LienDeficienciesManagementGridComponent extends ListView implements OnInit {
  readonly gridId: GridId = GridId.LienDeficiencies;

  public runIntegrationJob: IntegrationJob;
  public bsModalRef: BsModalRef;
  public actionBar$ = this.store.select(actionBar);
  public deficiencyCategories$ = this.store.select(lienDeficienciesGridSelectors.deficiencyCategories);
  public deficiencyCategories: IdValue[] = [];

  readonly actionBar: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
  };

  gridOptions: GridOptions = {
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
        headerName: 'Deficiency Type ID',
        field: 'deficiencyTypeId',
        width: 90,
        minWidth: 90,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Name',
        field: 'name',
        colId: 'deficiencyType.name',
        autoHeight: true,
        wrapText: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Category',
        field: 'category',
        colId:'deficiencyType.deficiencyCategory.id',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.deficiencyCategories }),
      },
      {
        headerName: 'Automated Status Change Date',
        field: 'automatedStatusChangeDate',
        colId:'lastModifiedDate',
        sortable: true,
        sort: 'desc',
        cellRenderer: data => this.datePipe.transform(data.value, true),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Active',
        field: 'active',
        sortable: true,
        cellRendererParams: { onChange: this.onStatusChange.bind(this) },
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 200,
      }
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { activeRenderer: LienDeficienciesManagementGridActionsRendererComponent },
  };

  constructor(
    private readonly actionsSubj: ActionsSubject,
    private readonly store: Store<AppState>,
    private readonly datePipe: DateFormatPipe,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.GetDeficiencyCategories());

    this.actionBar$
    .pipe(
      first(actionBar => !!actionBar),
      takeUntil(this.ngUnsubscribe$),
    )
    .subscribe(actionBar => {
      this.store.dispatch(commonActions.UpdateActionBar({ actionBar: {...actionBar, ...this.actionBar} }));
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.ChangeStatusComplete,
      ),
    ).subscribe(() => {
      this.store.dispatch(actions.GetList({ agGridParams: this.gridParams }));
    });

    this.deficiencyCategories$.pipe(
      takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(catigories => {
        this.deficiencyCategories.push(...catigories);
      })
  }

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  onStatusChange(data) {
    this.store.dispatch(actions.ChangeStatus({id: data.id, status: !data.active }));
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;

    this.store.dispatch(actions.GetList({ agGridParams: this.gridParams }));
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
