/* eslint-disable no-restricted-globals */
import { Component, Output, EventEmitter, OnInit, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, fromEvent } from 'rxjs';
import { GridApi, GridOptions } from 'ag-grid-community';
import * as fromContacts from '@app/modules/dashboard/persons/contacts/state';
import { debounceTime } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CurrencyHelper, PercentageHelper } from '@app/helpers';
import { PaymentMethodEnum } from '@app/models/enums/payment-method.enum';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ModalService, PermissionService } from '@app/services';

import { GridId } from '@app/models/enums/grid-id.enum';
import { PermissionActionTypeEnum, PermissionTypeEnum, DefaultGlobalSearchType } from '@app/models/enums';
import { ContactsEditComponent } from '@app/modules/dashboard/persons/contacts/contacts-edit/contacts-edit.component';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';

@Component({
  selector: 'app-probate-payment-information-contacts-list',
  templateUrl: './probate-payment-information-contacts-list.component.html',
  styleUrls: ['./probate-payment-information-contacts-list.component.scss'],
})
export class ProbatePaymentInformationContactsListComponent implements OnInit, OnDestroy {
  @Input() claimantId: number;
  @Output() public editStarted = new EventEmitter();
  totalPercentageAllocated: number;
  public readonly additionalPageItemsCountValues = [5];

  public gridId: GridId = GridId.ProbatePaymentInformationContacts;
  public ngUnsubscribe$ = new Subject<void>();
  public bsModalRef: BsModalRef;
  protected gridApi: GridApi;

  readonly personContacts$ = this.store.select(fromContacts.selectors.personContactPaidOnBehalfListSelector);
  private hasReadPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Read));

  public gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'First Name',
        field: 'person.firstName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Name',
        field: 'person.lastName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Payee Name',
        field: 'nameOnCheck',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: '% Split',
        field: 'percentageAllocation',
        width: 150,
        sortable: true,
        valueFormatter: params => PercentageHelper.toFractionPercentage(params?.data?.percentageAllocation, 2),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Amount Allocation',
        field: 'amountAllocation',
        sortable: true,
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Method',
        field: 'paymentMethodId',
        sortable: true,
        cellRenderer: ({ value }) => (value != null ? PaymentMethodEnum[value] : ''),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Address',
        field: 'person.primaryAddress.line1',
        colId: 'person.primaryAddress.lineOne',
        sortable: true,
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'Check Memo',
        field: 'memoText',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Special Instructions',
        field: 'specialInstructions',
        ...AGGridHelper.nameColumnDefaultParams,
        cellRenderer: ({ value }) => (value != null && value !== '' ? 'Yes' : 'No'),
      },
    ],
    components: { activeRenderer: CheckboxEditorRendererComponent },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public readonly searchType = DefaultGlobalSearchType.Claimants;

  constructor(
    private readonly store: Store<fromContacts.ContactState>,
    private readonly modalService: ModalService,
    private readonly permissionService: PermissionService,
  ) {}

  public ngOnInit(): void {
    if (this.permissionService.canRead(PermissionTypeEnum.ClientContact)) {
      this.store.dispatch(fromContacts.actions.GetAllPersonContactsRequest({ claimantId: this.claimantId }));
    }

    fromEvent(window, 'resize').pipe(debounceTime(50)).subscribe(() => {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();
      }
    });
  }

  public gridReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  protected onRowDoubleClicked(event): void {
    if (!event.data || !this.hasReadPermission) {
      return;
    }

    this.openModal(event.data, false);
  }

  private openModal(data, isEditMode: boolean): void {
    this.editStarted.emit();
    this.store.dispatch(fromContacts.actions.GetPersonContact({ clientContactId: data.id }));

    const initialState = {
      title: 'Contact Details',
      canEdit: isEditMode,
    };

    this.bsModalRef = this.modalService.show(ContactsEditComponent, {
      initialState,
      class: 'contact-modal',
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
