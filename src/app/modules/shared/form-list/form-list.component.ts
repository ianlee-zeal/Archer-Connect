import {
  Component, Input, Output, EventEmitter, OnDestroy, OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { GridOptions } from 'ag-grid-community';
import { Subject } from 'rxjs';

import { SideNavMenuService } from '@app/services/navigation/side-nav-menu.service';
import { AGGridHelper } from '@app/helpers';
import * as formShared from '../state';
import * as sharedActions from '../state/common.actions';
import { checkboxColumn } from '../_grid-columns/columns';
import { ActionHandlersMap } from '../action-bar/action-handlers-map';

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
})
export class FormListComponent implements OnInit, OnDestroy {
  @Input() rowData;
  @Output() rowDoubleClicked = new EventEmitter();

  public ngDestroyed$ = new Subject<void>();
  public index$ = this.store.select(formShared.sharedSelectors.commonSelectors.formsIndex);
  public search_term;

  public gridOptions: GridOptions = {
    columnDefs: [
      checkboxColumn,
      {
        headerName: 'Name',
        field: 'name',
        width: 600,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Type',
        field: 'form_type',
        width: 200,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'User',
        field: 'user_name',
        width: 200,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Updated',
        field: 'updatedOn',
        width: 120,
        sortable: true,
        cellStyle: { textAlign: 'right' },
        cellRenderer: data => (data.value ? new Date(data.value).toLocaleDateString() : ''),
        resizable: true,
      },
    ],
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public actionBarActionHandlers: ActionHandlersMap = {};

  constructor(
    private store: Store<formShared.AppState>,
    private router: Router,
    private sideNavMenuService: SideNavMenuService
  ) {

  }

  public ngOnInit(): void {
    this.sideNavMenuService.removeAll();
    this.sideNavMenuService.injectMainMenu();
    this.store.dispatch(sharedActions.GetForms({ search: null }));
  }

  private onRowDoubleClicked(row): void {
    this.rowDoubleClicked.emit(row);
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }

  // eslint-disable-next-line class-methods-use-this
  search() { }

  // eslint-disable-next-line class-methods-use-this
  clearSearch() { }
}
