import { Component, OnInit } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridOptions, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';

import { OrganizationRoleUser } from '@app/models/organization-role-user';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DateFormatPipe } from '@shared/_pipes';
import { checkboxColumn } from '@shared/_grid-columns/columns';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ofType } from '@ngrx/effects';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { UsersState } from '../state/state';

@Component({
  selector: 'app-user-roles-page',
  templateUrl: 'user-roles-page.component.html',
  styleUrls: ['./user-roles-page.styles.scss'],
})
export class UserRolesPageComponent implements OnInit {
  readonly user$ = this.store.select(selectors.currentUser);
  readonly userRoles$ = this.store.select(selectors.currentUserRoles);

  public readonly gridId: GridId = GridId.UserRoles;
  public isUserRolesFetched: boolean = false;

  readonly rolesGridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      {
        ...checkboxColumn,
        width: 50,
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy',
        sortable: true,
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
      },
    ],
    rowSelection: 'single',
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onSelectionChanged: this.selectionChanged.bind(this),
  };

  private gridApi: GridApi;

  constructor(
    private store: Store<UsersState>,
    private datePipe: DateFormatPipe,
    private actions$: ActionsSubject,
  ) {
  }

  ngOnInit(): void {
    this.user$.pipe(
      first(user => !!user),
    ).subscribe(() => {
      this.store.dispatch(actions.GetUserRoles());
    });

    this.actions$
      .pipe(
        ofType(actions.GetUserRolesComplete),
        first(),
      )
      .subscribe(() => { this.isUserRolesFetched = true; });
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
  }

  private selectionChanged(): void {
    const selectedRole = this.gridApi.getSelectedRows()[0] as OrganizationRoleUser;
    this.store.dispatch(actions.SelectRole({ role: selectedRole }));
  }
}
