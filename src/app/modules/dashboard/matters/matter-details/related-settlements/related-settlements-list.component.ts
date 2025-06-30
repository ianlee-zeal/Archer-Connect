import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { filter, takeUntil } from 'rxjs/operators';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { AppState } from '../../../../shared/state';
import { actions } from '../../state';
import * as selectors from '../../state/selectors';

@Component({
  selector: 'app-related-settlements-list',
  templateUrl: './related-settlements-list.component.html',
  styleUrls: ['./related-settlements-list.component.scss'],
})
export class RelatedSettlementListComponent extends ListView implements OnInit, OnDestroy {
  public matterId: number;
  public readonly gridId: GridId = GridId.RelatedSettlements;
  private readonly actionBar: ActionHandlersMap = {
    back: { callback: () => this.cancel() },
    clearFilter: this.clearFilterAction(),
  };
  public matter$ = this.store.select(selectors.matter);

  public gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Primary Firm',
        field: 'primaryFirm',
        colId: 'org.name',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    this.store.dispatch(actions.GetRelatedSettlementsListRequest({ agGridParams, matterId: this.matterId }));
  }

  constructor(
    public store: Store<AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.matter$
      .pipe(
        filter(matter => !!matter),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(matter => {
        this.matterId = matter.id;
        if (this.gridParams) {
          this.fetchData(this.gridParams);
        }
      });
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  public cancel(): void {
    this.store.dispatch(GotoParentView());
  }

  protected onRowDoubleClicked({ data }): void {
    this.router.navigate(['settlements', data.id, 'tabs', 'details']);
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
