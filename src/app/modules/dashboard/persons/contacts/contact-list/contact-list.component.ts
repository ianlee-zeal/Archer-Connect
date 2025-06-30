import { ArrayHelper } from '@app/helpers/array.helper';
import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions, ColDef, GridApi } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';

import * as fromRoot from '@app/state';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ModalService } from '@app/services/modal.service';

import { GridId } from '@app/models/enums/grid-id.enum';
import { PermissionService } from '@app/services';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { CurrencyHelper, PercentageHelper } from '@app/helpers';
import { PrimaryTagRendererComponent } from '@app/modules/shared/_renderers/primary-tag-renderer/primary-tag-renderer.component';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import * as fromContacts from '../state';
import { ContactListActionsRendererComponent } from './contact-list-actions-renderer/contact-list-actions-renderer.component';
import { ContactsEditComponent } from '../contacts-edit/contacts-edit.component';
import { DateFormatPipe } from '@app/modules/shared/_pipes'

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent implements OnInit, OnDestroy {
  @Input() claimantId: number;
  @Input() entityType = EntityTypeEnum.Clients;
  @Input() showOrganizationColumn = false;
  @Output() public newRecord = new EventEmitter();
  @Output() public editStarted = new EventEmitter();

  public gridId: GridId = GridId.Contacts;
  protected gridApi: GridApi;

  public ngUnsubscribe$ = new Subject<void>();
  public bsModalRef: BsModalRef;

  public personContacts$ = this.store.select(fromContacts.selectors.personContactListSelector);
  public personRelationshipTypeValues$ = this.rootStore.select(fromRoot.personRelationshipTypeValues);
  public personRepresentativeTypesValues$ = this.rootStore.select(fromRoot.personRepresentativeTypesValues);

  private hasReadPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Read));
  private canReadLegalContactsPermission = this.permissionService.canRead(PermissionTypeEnum.LegalContacts);
  private readonly canViewAuditInfoPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.AuditInfo, PermissionActionTypeEnum.ClaimantContacts));
  private phoneNumberField = 'person.primaryPhone.number';

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Primary',
        field: 'isPrimaryContact',
        sortable: true,
        cellRenderer: 'primaryRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 100,
      },
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
        headerName: 'Role',
        field: 'representativeType.name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Relationship',
        field: 'relationshipType.name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Phone Number',
        field: this.phoneNumberField,
        sortable: true,
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
        headerName: 'City',
        field: 'person.primaryAddress.city',
        sortable: true,
        ...AGGridHelper.cityColumnDefaultParams,
      },
      {
        headerName: 'State',
        field: 'person.primaryAddress.state',
        sortable: true,
        ...AGGridHelper.stateColumnDefaultParams,
      },
      {
        headerName: 'Zip',
        field: 'person.primaryAddress.zip',
        sortable: true,
        ...AGGridHelper.zipColumnDefaultParams,
      },
      {
        headerName: 'Payee',
        field: 'nameOnCheck',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Paid OBO Claimant',
        field: 'isPaidOnBehalfOfClaimant',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 150,
      },
      {
        headerName: 'Release Signature Required',
        field: 'isReleaseSignatureRequired',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 190,
      },
      {
        headerName: 'Check Memo',
        field: 'memoText',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Percentage Split',
        field: 'percentageAllocation',
        maxWidth: 150,
        sortable: true,
        valueFormatter: params => PercentageHelper.toFractionPercentage(params?.data?.percentageAllocation, 2),
        ...AGGridHelper.getPercentageFilter(),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Amount Allocation',
        field: 'amountAllocation',
        sortable: true,
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Legal Contact',
        field: 'isLegalContact',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 150,
        hide: !this.canReadLegalContactsPermission,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
        hide: !this.canViewAuditInfoPermission,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.dateFormatPipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        hide: !this.canViewAuditInfoPermission,
      },
      AGGridHelper.getActionsColumn({
        editHandler: this.onEditHandler.bind(this),
        viewPersonDetailsHandler: this.onViewPersonDetailsHandler.bind(this),
      }),
    ],
    components: {
      buttonRenderer: ContactListActionsRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
      primaryRenderer: PrimaryTagRendererComponent,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    private readonly store: Store<fromContacts.ContactState>,
    private readonly rootStore: Store<fromRoot.AppState>,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly permissionService: PermissionService,
    private readonly dateFormatPipe: DateFormatPipe,
  ) {

  }

  public ngOnInit(): void {
    this.store.dispatch(fromContacts.actions.GetAllPersonContactsRequest({ claimantId: this.claimantId }));

    fromEvent(window, 'resize').pipe(debounceTime(50)).subscribe(() => {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();
      }
    });

    if (this.showOrganizationColumn) {
      const phoneNumberIndex = this.gridOptions.columnDefs.findIndex(c => (c as ColDef).field === this.phoneNumberField);
      if (phoneNumberIndex >= 0) {
        this.gridOptions.columnDefs = ArrayHelper.insertAt(this.gridOptions.columnDefs, phoneNumberIndex, {
          headerName: 'Organization',
          field: 'person.organization.name',
          sortable: true,
          ...AGGridHelper.stateColumnDefaultParams,
          minWidth: 120,
        });
      }
    }
  }

  public gridReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  private onEditHandler({ data }): void {
    this.openModal(data, true);
  }

  private onViewPersonDetailsHandler({ data }): void {
    const { url } = this.router;
    this.router.navigate([`dashboard/persons/${data.person.id}`], { state: { prevPersonId: data.parentPersonId, personPreviousUrl: url } });
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
      claimantId: this.claimantId,
      entityType: this.entityType,
    };

    this.bsModalRef = this.modalService.show(ContactsEditComponent, {
      initialState,
      class: 'contact-modal',
    });
  }

  public addNewRecord(): void {
    this.newRecord.emit();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
