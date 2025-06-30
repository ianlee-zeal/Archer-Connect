import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import * as fromShared from '@app/state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridId } from '@app/models/enums/grid-id.enum';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { filter, first, takeUntil } from 'rxjs/operators';
import { DateFormatPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ModalService, PermissionService } from '@app/services';
import { EntityTypeEnum, PaymentMethodEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { IdValue } from '@app/models';
import * as rootActions from '@app/state/root.actions';
import { sharedActions } from 'src/app/modules/shared/state/index';
import { AddressesListSearchParams } from '@app/modules/addresses/address-list/state/actions';
import * as projectActions from '@app/modules/projects/state/actions';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings';
import { ElectionFormHelper } from '@app/helpers/election-form.helper';
import { Claimant } from '@app/models/claimant';
import { ClaimantElectionFormsListActionPanelRendererComponent } from './claimant-election-forms-list-action-panel-renderer/claimant-election-forms-list-action-panel-renderer.component';
import { ElectionFormModalComponent } from '../election-form-modal/election-form-modal.component';
import * as actions from '../../../state/actions';
import * as selectors from '../../../state/selectors';
import { EditElectionFormModalComponent } from '../edit-election-form-modal/edit-election-form-modal.component';

@Component({
  selector: 'app-claimant-election-forms-list',
  templateUrl: './claimant-election-forms-list.component.html',
  styleUrls: ['./claimant-election-forms-list.component.scss'],
})
export class ClaimantElectionFormsListComponent extends ListView implements OnInit, OnDestroy {
  public client$ = this.store.select(selectors.item);
  public electionFormList$ = this.store.select(selectors.electionFormList);
  public readonly ledgerSettings$ = this.store.select(projectSelectors.ledgerSettings);

  public readonly gridId: GridId = GridId.ClaimantElectionFormsList;
  private readonly electionFormStatusOptions: IdValue[] = [];
  private readonly electionFormStatusOptions$ = this.store.select(fromShared.electionFormStatusOptions);
  public clientId: number;
  private ledgerSettings: ClaimSettlementLedgerSettings;

  private actionBar: ActionHandlersMap = {
    back: { callback: () => this.store.dispatch(GotoParentView()) },
    new: {
      callback: () => this.openCreateElectionFormModal(),
      permissions: PermissionService.create(PermissionTypeEnum.ElectionForms, PermissionActionTypeEnum.Create),
    },
    clearFilter: super.clearFilterAction(),
  };

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Disbursement Group ',
        field: 'disbursementGroup.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 200,
      },
      {
        headerName: 'Status',
        field: 'electionFormStatus.name',
        colId: 'electionFormStatus.id',
        width: 180,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.electionFormStatusOptions }),
      },
      {
        headerName: 'Election Form Received',
        field: 'received',
        colId: 'received',
        sortable: false,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 200,
      },
      {
        headerName: 'Date Received',
        field: 'receivedDate',
        sortable: true,
        minWidth: 150,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnFilter(),
        ...AGGridHelper.dateColumnDefaultParams,
      },
      {
        headerName: 'Format Received',
        field: 'documentChannel.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 100,
        width: 100,
      },
      {
        headerName: 'Method of Payment',
        field: 'efPaymentMethod.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Address Change Required',
        field: 'addressChange',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 200,
      },
      ElectionFormHelper.getDigitalPaymentColumn(
        (data: ICellRendererParams): string => this.yesNoPipe.transform(data.value === PaymentMethodEnum.DigitalPayment),
      ),

      AGGridHelper.getActionsColumn({
        onViewElectionFormHandler: this.viewElectionForm.bind(this),
        onEditElectionFormHandler: this.editElectionForm.bind(this),
      }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: ClaimantElectionFormsListActionPanelRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
    },
    onRowDoubleClicked: this.viewElectionForm.bind(this),
  };

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
    private readonly datePipe: DateFormatPipe,
    private readonly modalService: ModalService,
    private readonly yesNoPipe: YesNoPipe,
  ) { super(router, elementRef); }

  ngOnInit(): void {
    this.client$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter((client: Claimant) => !!client),
    ).subscribe((client: Claimant) => {
      this.clientId = client.id;
      this.store.dispatch(sharedActions.addressesListActions.GetAddressesList({
        searchParams: {
          entityId: client.personId,
          entityType: EntityTypeEnum.Persons,
        } as AddressesListSearchParams,
      }));
      // Get Ledger Settings related to current project
      this.store.dispatch(projectActions.GetLedgerSettings({ projectId: client.project?.id }));
    });

    this.electionFormStatusOptions$.pipe(
      first((opts: IdValue[]) => !!opts && !!opts.length),
    ).subscribe((opts: IdValue[]) => {
      this.electionFormStatusOptions.push(...opts);
    });

    this.ledgerSettings$
      .pipe(
        filter((settings: ClaimSettlementLedgerSettings) => !!settings),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((settings: ClaimSettlementLedgerSettings) => {
        this.ledgerSettings = settings;
      });

    this.store.dispatch(rootActions.GetElectionFormStatuses());
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: this.actionBar }));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    AGGridHelper.replaceSortColIdInSearchRequest(params.request, 'electionFormStatus.id', 'electionFormStatus.name');
    this.store.dispatch(actions.GetElectionFormList({ clientId: this.clientId, agGridParams: this.gridParams }));
  }

  private viewElectionForm({ data }): void {
    const { id } = data;

    this.modalService.show(ElectionFormModalComponent, {
      initialState: { title: 'Election Form', electionFormId: id },
      class: 'election-form-modal',
    });
  }

  private editElectionForm({ data }): void {
    const { id } = data;

    this.modalService.show(EditElectionFormModalComponent, {
      initialState: { title: 'Election Form', electionFormId: id },
      class: 'edit-election-form-modal',
    });
  }

  private openCreateElectionFormModal(): void {
    this.modalService.show(EditElectionFormModalComponent, {
      initialState: { title: 'Election Form' },
      class: 'edit-election-form-modal',
    });
  }
}
