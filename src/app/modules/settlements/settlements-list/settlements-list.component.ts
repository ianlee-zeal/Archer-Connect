/* eslint-disable no-restricted-globals */
import { Component, OnInit, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Router } from '@angular/router';

import { ModalService } from '@app/services/modal.service';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';

import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

import { RelatedPage } from '@app/modules/shared/grid-pager';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { GridId } from '@app/models/enums/grid-id.enum';
import { SettlementsAddComponent } from '../settlements-add/settlements-add.component';
import { actions } from '../state';
import { AppState } from '@shared/state';

@Component({
  selector: 'app-settlement-list',
  templateUrl: './settlements-list.component.html',
})
export class SettlementsListComponent extends ListView implements OnInit {
  public readonly gridId: GridId = GridId.Settlements;

  public bsModalRef: BsModalRef;

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Tort',
        field: 'matter',
        colId: 'tort.name',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        resizable: true,
      },
      {
        headerName: 'Firm',
        field: 'org',
        colId: 'org.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public actionBarActionHandlers: ActionHandlersMap = {
    new: {
      callback: () => this.onAdd(),
      permissions: PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Create),
    },
    clearFilter: this.clearFilterAction(),
  };

  constructor(
    public store: Store<AppState>,
    public modalService: ModalService,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    super.ngOnInit();
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (row) {
      const navSettings = AGGridHelper.getNavSettings(this.gridApi);
      this.store.dispatch(CreatePager({ relatedPage: RelatedPage.SettlementsFromSearch, settings: navSettings }));
      this.router.navigate(
        ['settlements', row.id],
        { state: { navSettings } },
      );
    }
  }

  public addNewRecord(): void {
    this.onAdd();
  }

  private onAdd(): void {
    const initialState = {
      title: 'Create new settlement'
    };

    this.bsModalRef = this.modalService.show(SettlementsAddComponent, {
      initialState,
      class: 'add-settlement-modal',
    });
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  protected fetchData(agGridParams): void {
    this.gridParams = agGridParams;
    this.store.dispatch(actions.GetSettlementsList({ agGridParams }));
  }
}
