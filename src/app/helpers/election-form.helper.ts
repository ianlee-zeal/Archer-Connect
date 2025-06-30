/* eslint-disable no-param-reassign */
import { PaymentMethodEnum } from '@app/models/enums/payment-method.enum';
import { ColDef } from 'ag-grid-community';
import { AGGridHelper } from './ag-grid.helper';

export class ElectionFormHelper {
  public static getDigitalPaymentColumn(cellRenderer: (data) => string): ColDef {
    return {
      headerName: 'Digital Payments?',
      field: 'paymentMethodId',
      sortable: true,
      ...AGGridHelper.getDropdownColumnFilter({
        options: [
          {
            id: PaymentMethodEnum.Check,
            name: 'No',
          },
          {
            id: PaymentMethodEnum.DigitalPayment,
            name: 'Yes',
          },
        ],
      }),
      cellRenderer,
      minWidth: 200,
    };
  }
}
