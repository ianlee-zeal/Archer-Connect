import { Component, OnInit, ElementRef, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { ModalService, PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { actions } from '../state';
import { AppState } from '../../../shared/state';
import { MatterAddComponent } from '../matter-add/matter-add.component';

@Component({
  selector: 'app-matters-list',
  templateUrl: './matters-list.component.html',
  styleUrls: ['./matters-list.component.scss'],
})
export class MattersListComponent extends ListView implements OnInit, OnDestroy {
  @Input() public gridId: GridId;

  private readonly actionBar: ActionHandlersMap = {
    new: {
      callback: () => this.addNew(),
      permissions: PermissionService.create(PermissionTypeEnum.Matters, PermissionActionTypeEnum.Create),
    },
    clearFilter: this.clearFilterAction(),
  };

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
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(actions.GetMattersListRequest({ agGridParams }));
  }

  constructor(
    public store: Store<AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
    private readonly modalService: ModalService,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  protected onRowDoubleClicked({ data }): void {
    const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
    this.store.dispatch(
      CreatePager({
        relatedPage: RelatedPage.MattersFromSearch,
        settings: navSettings,
      }),
    );

    this.router.navigate(['dashboard', 'matters', data.id]);
  }

  public addNew() {
    const initialState = { title: 'Create new Tort' };

    this.modalService.show(MatterAddComponent, {
      initialState,
      class: 'add-matter-modal',
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
