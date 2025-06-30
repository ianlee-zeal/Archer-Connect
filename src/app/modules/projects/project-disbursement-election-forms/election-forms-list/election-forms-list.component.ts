import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

import cloneDeep from 'lodash-es/cloneDeep';
import { Store } from '@ngrx/store';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe, EnumToArrayPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { GridId } from '@app/models/enums/grid-id.enum';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalService } from '@app/services';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { ColumnExport, IdValue } from '@app/models';
import * as fromShared from '@app/state';
import * as rootActions from '@app/state/root.actions';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { sharedActions } from 'src/app/modules/shared/state/index';
import * as exportsActions from '@app/modules/shared/state/exports/actions';
import { IExportRequest } from '@app/models/export-request';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { PusherService } from '@app/services/pusher.service';
import { StringHelper } from '@app/helpers';
import { EntityTypeEnum, ExportLoadingStatus, JobNameEnum, PaymentMethodEnum } from '@app/models/enums';
import { LogService } from '@app/services/log-service';

import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings';
import { ElectionFormHelper } from '@app/helpers/election-form.helper';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GetElectionFormsGrid } from '../state/actions';
import * as projectActions from '../../state/actions';
import * as projectSelectors from '../../state/selectors';
import * as actions from '../state/actions';
import { ElectionFormsRendererComponent } from '../renderers/election-forms-buttons-renderer';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-election-forms-list',
  templateUrl: './election-forms-list.component.html',
  styleUrls: ['./election-forms-list.component.scss'],
})
export class ElectionFormsListComponent extends ListView implements OnInit, OnDestroy {
  public readonly gridId: GridId = GridId.ElectionForms;
  @Input() public projectId: number;

  public actionBar$ = this.store.select(projectSelectors.actionBar);
  public bsModalRef: BsModalRef;
  public actionBar = {
    clearFilter: this.clearFilterAction(),
    download: {
      disabled: (): boolean => this.isExporting || this.gridApi?.getDisplayedRowCount() === 0,
      options: [
        { name: 'Standard', callback: (): void => this.export() },
      ],
    },
    exporting: { hidden: (): boolean => !this.isExporting },
  };
  private readonly electionFormStatusOptions: IdValue[] = [];
  private readonly electionFormStatusOptions$ = this.store.select(fromShared.electionFormStatusOptions);
  public readonly ledgerSettings$ = this.store.select(projectSelectors.ledgerSettings);
  private isExporting: boolean = false;
  private ledgerSettings: ClaimSettlementLedgerSettings;

  protected ngUnsubscribe$ = new Subject<void>();
  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Client ID',
        field: 'clientId',
        colId: 'client.id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        colId: 'client.firstName',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        colId: 'client.lastName',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Primary Firm',
        field: 'primaryFirm.name',
        colId: 'client.org.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Status',
        field: 'status.name',
        colId: 'electionFormStatus.id',
        width: 180,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.electionFormStatusOptions }),
      },
      {
        headerName: 'Claimant Net',
        field: 'netAllocation',
        hide: true,
      },
      {
        headerName: 'EF Received?',
        field: 'received',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        width: 110,
        minWidth: 110,
      },
      {
        headerName: 'Date Received?',
        field: 'dateReceived',
        colId: 'receivedDate',
        resizable: true,
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.dateFormatPipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Payment Type',
        field: 'paymentType',
        colId: 'efPaymentMethod.name',
        resizable: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Address Change',
        field: 'addressChange',
        sortable: true,
        width: 130,
        minWidth: 130,
        suppressSizeToFit: true,
        ...AGGridHelper.getYesNoFilter(),
        cellRenderer: (data: ICellRendererParams): string => this.yesNoPipe.transform(data.value),
      },
      {
        headerName: 'Document Tracking ID',
        field: 'docusignId',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      ElectionFormHelper.getDigitalPaymentColumn((data: ICellRendererParams): string => this.yesNoPipe.transform(this.ledgerSettings?.isDigitalPaymentsEnabled && data.value === PaymentMethodEnum.DigitalPayment)),
      {
        headerName: 'Disbursement Group',
        field: 'disbursementGroup.name',
        resizable: true,
        sortable: false,
        ...AGGridHelper.getCustomTextColumnFilter(),
        width: 170,
        suppressSizeToFit: true,
        filter: false,
      },
      AGGridHelper.getActionsColumn({ editElectionFormHandler: this.editElectionForm.bind(this) }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    components: {
      buttonRenderer: ElectionFormsRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
    },
  };

  constructor(
    private store: Store<fromShared.AppState>,
    private yesNoPipe: YesNoPipe,
    protected router: Router,
    public modalService: ModalService,
    protected elementRef : ElementRef,
    private readonly dateFormatPipe: DateFormatPipe,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly logger: LogService,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.actionBar$.pipe(first())
      .subscribe(
        (actionBar: ActionHandlersMap) => {
          this.store.dispatch(projectActions.UpdateActionBar({ ...actionBar, actionBar: this.actionBar }));
        },
      );

    this.electionFormStatusOptions$.pipe(
      first((opts: IdValue[]) => !!opts && !!opts.length),
    ).subscribe((opts: IdValue[]) => {
      this.electionFormStatusOptions.push(...opts);
    });

    this.store.select(exportsSelectors.isExporting)
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((result: boolean) => {
        this.isExporting = result;
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
    // Get Ledger Settings related to current project
    this.store.dispatch(projectActions.GetLedgerSettings({ projectId: this.projectId }));
  }

  public editElectionForm(clientId: number): void {
    this.router.navigate([`/claimants/${clientId}/payments/tabs/election-form`]);
  }

  protected onRowDoubleClicked(row): void {
    this.editElectionForm(row.data.clientId);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    AGGridHelper.replaceSortColIdInSearchRequest(agGridParams.request, 'electionFormStatus.id', 'electionFormStatus.name');
    this.store.dispatch(GetElectionFormsGrid({ agGridParams, projectId: this.projectId }));
  }

  private export(): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    this.actionBar$.pipe(first())
      .subscribe(() => this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBar })));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportElectionForms, this.projectId, EntityTypeEnum.Projects);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map((i: IdValue) => i.name),
      this.exportCallback.bind(this),
      () => {
        const exportRequest: IExportRequest = {
          name: 'Election Forms',
          channelName,
          columns: this.getExportColumns(),
          searchOptions: this.getExportSearchParam(),
        };
        this.store.dispatch(actions.ExportElectionForms({ exportRequest }));
      },
    );
  }

  private getExportColumns(): ColumnExport[] {
    const columns: ColumnExport[] = [];

    this.gridOptions.columnDefs.forEach((colDef: ColDef) => {
      if (colDef.headerName === 'Actions') {
        return;
      }

      const container: ColumnExport = {
        name: colDef.headerName,
        field: colDef.colId ?? colDef.field,
      };

      if (container.field === 'electionFormStatus.id') {
        container.field = 'electionFormStatus.name';
      }

      if (container.field === 'paymentMethodId') {
        container.field = 'isDigitalPayment';
      }

      columns.push(container);
    });

    const addressFields: ColumnExport[] = [
      { name: 'Line One', field: 'client.person.primaryAddress.lineOne' },
      { name: 'Line Two', field: 'client.person.primaryAddress.lineTwo' },
      { name: 'City', field: 'client.person.primaryAddress.city' },
      { name: 'State', field: 'client.person.primaryAddress.state' },
      { name: 'Zip Code', field: 'client.person.primaryAddress.zipCode' },
      { name: 'EF - Line One', field: 'addressLineOne' },
      { name: 'EF - Line Two', field: 'addressLineTwo' },
      { name: 'EF - City', field: 'addressCity' },
      { name: 'EF - State', field: 'addressState' },
      { name: 'EF - Zip Code', field: 'addressZip' },
    ];

    columns.push(...addressFields);

    return columns;
  }

  private getExportSearchParam(): IServerSideGetRowsRequestExtended {
    const searchParams: IServerSideGetRowsRequestExtended = cloneDeep(this.getExportParams().request);

    for (const filterModel of searchParams.filterModel) {
      if (filterModel.key === 'received') {
        filterModel.key = 'receivedDate';
        filterModel.filterType = FilterTypes.Exists;
      } else if (filterModel.key === 'addressChange') {
        filterModel.filterType = FilterTypes.Boolean;
        filterModel.filter = filterModel.filter === 1;
      }
    }

    const receivedSort = searchParams.sortModel.find((sm: ColDef) => sm.colId === 'received');
    if (receivedSort) {
      receivedSort.colId = 'receivedDate';
    }

    searchParams.filterModel.push(new FilterModel({
      filter: this.projectId,
      filterType: FilterTypes.Number,
      key: 'client.caseId',
      type: 'equals',
    }));

    return searchParams;
  }

  private exportCallback(data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(sharedActions.documentsListActions.DownloadDocument({ id: data.docId }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      case ExportLoadingStatus.Error:
        this.logger.log('Error during export', data, event);
        this.store.dispatch(actions.Error({ errorMessage: data.message }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      default:
        break;
    }
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
  }
}
