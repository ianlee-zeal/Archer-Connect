import { Component, Input } from '@angular/core';
import { GridOptions, GridApi } from 'ag-grid-community';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { SsnPipe } from '@app/modules/shared/_pipes';
import { checkboxColumn } from '@app/modules/shared/_grid-columns/columns';
import { Person } from '@app/models/person';
import { GridId } from '@app/models/enums/grid-id.enum';

@Component({
  selector: 'app-contacts-link-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss'],
})
export class ContactsLinkPersonListComponent {
  @Input() persons: any;

  public readonly gridId: GridId = GridId.PersonContacts;

  public selectedPerson: Person;
  protected gridApi: GridApi;

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      {
        ...checkboxColumn,
        minWidth: 40,
      },
      {
        headerName: 'Name',
        field: 'fullName',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'SSN',
        field: 'cleanSsn',
        cellRenderer: data => this.ssnPipe.transform(data.value),
        ...AGGridHelper.ssnColumnDefaultParams,

      },
      {
        headerName: 'Phone Number ',
        field: 'primaryPhone.number',
        ...AGGridHelper.phoneColumnDefaultParams,
        minWidth: 160,
      },
      {
        headerName: 'Email',
        field: 'primaryEmail.email',
        ...AGGridHelper.emailColumnDefaultParams,
        minWidth: 160,
      },
      {
        headerName: 'Address',
        field: 'primaryAddress.lineOne',
        ...AGGridHelper.addressColumnDefaultParams,
        minWidth: 170,
        width: 170,
      },
    ],
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    rowSelection: 'single',
    onPaginationChanged: () => {},
    onSelectionChanged: this.selectionChanged.bind(this),
    suppressHorizontalScroll: true,
  };

  constructor(
    private readonly ssnPipe: SsnPipe,
  ) {}

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
  }

  private selectionChanged(): void {
    this.selectedPerson = this.gridApi.getSelectedRows().shift();
  }
}
