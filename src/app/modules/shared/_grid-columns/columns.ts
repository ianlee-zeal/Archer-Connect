import { ColDef } from 'ag-grid-community';

export const checkboxColumn: ColDef = {
  checkboxSelection: true,
  width: 35,
  minWidth: 35,
  pinned: 'left',
  resizable: false,
  sortable: false,
  suppressMenu: true,
  suppressSizeToFit: true,
};
