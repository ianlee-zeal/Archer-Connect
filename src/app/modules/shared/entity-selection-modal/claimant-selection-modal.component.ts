import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as clientsListActions from '@app/modules/shared/state/clients-list/actions';
import { SsnPipe, DateFormatPipe, PhoneNumberPipe } from '@app/modules/shared/_pipes';
import { Component, ElementRef } from '@angular/core';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { Store } from '@ngrx/store';
import { ModalService } from '@app/services';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CheckboxEditorRendererComponent } from '../_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-claimant-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class ClaimantSelectionModalComponent extends EntitySelectionModalComponent {
  title = 'Claimant Selection';
  gridId = GridId.ProjectSelection;
  entityLabel = 'Claimant Selection';
  isMultiple: boolean = false;
  caseId: number;
  key: string;

  gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Active',
        field: 'isActive',
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 60,
        minWidth: 60,
        maxWidth: 60
      },
      {
        headerName: 'Client ID',
        field: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'SSN',
        field: 'person.cleanSsn',
        sortable: true,
        cellRenderer: data => this.ssnPipe.transform(data.value),
        ...AGGridHelper.getCustomTextColumnFilter({ stripDashes: true }),
        ...AGGridHelper.ssnColumnDefaultParams,
      },
      {
        headerName: 'Date of Birth',
        field: 'person.dateOfBirth',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        tooltipValueGetter: () => null,
      },
      {
        headerName: 'Phone Number',
        field: 'person.primaryPhone.number',
        cellRenderer: data => this.phoneNumberPipe.transform(data.value),
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ stripDashes: true }),
        ...AGGridHelper.phoneColumnDefaultParams,
      },
      {
        headerName: 'State',
        field: 'person.primaryAddress.state',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.stateColumnDefaultParams,
      },
      {
        headerName: 'Project Name',
        field: 'case.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Project ID',
        field: 'caseId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Primary Firm',
        field: 'org.name',
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
    components: {
      activeRenderer: CheckboxEditorRendererComponent,
    },
  };

  constructor(
    private datePipe: DateFormatPipe,
    private ssnPipe: SsnPipe,
    private readonly phoneNumberPipe: PhoneNumberPipe,
    store: Store<any>,
    modalService: ModalService,
    router: Router,
    elemRef: ElementRef<any>,
    public modalRef: BsModalRef,
  ) {
    super(store, modalService, router, elemRef, modalRef);
  }

  gridDataFetcher = (params: IServerSideGetRowsParamsExtended): void => {
    this.store.dispatch(clientsListActions.GetAGClients({ params }));
  };
}
