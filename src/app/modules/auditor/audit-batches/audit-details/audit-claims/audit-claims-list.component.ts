import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ElementRef, OnDestroy, ViewRef } from '@angular/core';
import { takeUntil, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { DateFormatPipe, SsnPipe } from '@app/modules/shared/_pipes';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { AuditBatchUploading, AuditValidationResultTypes } from '@app/models/enums/audit-batch-uploading.enum';

import { SelectOption } from '@app/modules/shared/_abstractions/base-select';

import { AppState } from '@app/modules/shared/state';

import { DownloadDocument } from '@app/modules/shared/state/upload-bulk-document/actions';
import { AuditRun } from '@app/models/auditor/audit-run';

import * as auditorActions from '@app/modules/auditor/state/actions';


import { FilterModel } from '@app/models/advanced-search/filter-model';
import { StringHelper } from '@app/helpers';
import { ExportLoadingStatus, JobNameEnum } from '@app/models/enums';
import { Channel } from 'pusher-js';
import { PusherService } from '@app/services/pusher.service';
import { AuditClaimsActionsRendererComponent } from './audit-claims-actions-renderer/audit-claims-actions-renderer.component';
import * as selectors from '../state/selectors';
import * as auditDetailsActions from '../state/actions';

@Component({
  selector: 'app-audit-claims-list',
  templateUrl: './audit-claims-list.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AuditClaimsListComponent extends ListView implements OnInit, OnDestroy {
  public auditRun: AuditRun;
  public readonly gridId: GridId = GridId.AuditClaims;
  protected channel: Channel;
  public isExporting = false;

  private resultOpts: SelectOption[] = [];
  gridOptions: GridOptions;
  private setGrid(): void {
    this.gridOptions = {
      animateRows: false,
      columnDefs: [
        {
          headerName: 'Lien ID',
          field: 'lienId',
          colId: 'lienId',
          width: 50,
          sortable: true,
          resizable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        },
        {
          headerName: 'Client ID',
          field: 'clientId',
          colId: 'clientId',
          width: 50,
          sortable: true,
          resizable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        },
        {
          headerName: 'Case Number',
          field: 'caseNumber',
          colId: 'caseNumber',
          width: 50,
          sortable: true,
          resizable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
        },
        {
          headerName: 'Client Drug Ingested',
          field: 'clientDrugIngested',
          colId: 'clientDrugIngested',
          minWidth: 100,
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Client Last Name',
          field: 'clientLastName',
          colId: 'clientLastName',
          minWidth: 100,
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Client First Name',
          field: 'clientFirstName',
          colId: 'clientFirstName',
          minWidth: 100,
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Client SSN',
          field: 'clientSsn',
          colId: 'clientSsn',
          minWidth: 100,
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter({ stripDashes: true }),
          cellRenderer: data => this.ssnPipe.transform(data.value),
          ...AGGridHelper.ssnColumnDefaultParams,
        },
        {
          headerName: 'Lien Holder Name',
          field: 'lienHolderName',
          colId: 'lienHolderName',
          minWidth: 100,
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Client Injury Date',
          field: 'clientInjuryDate',
          colId: 'clientInjuryDate',
          sortable: true,
          cellRenderer: data => this.datePipe.transform(data.value, false),
          ...AGGridHelper.dateTimeColumnDefaultParams,
          ...AGGridHelper.dateColumnFilter(),
        },
        {
          headerName: 'Client Ingestion Date',
          field: 'clientIngestionDate',
          colId: 'clientIngestionDate',
          sortable: true,
          cellRenderer: data => this.datePipe.transform(data.value, false),
          ...AGGridHelper.dateTimeColumnDefaultParams,
          ...AGGridHelper.dateColumnFilter(),
        },
        {
          headerName: 'Client Description Of Injury',
          field: 'clientDescriptionOfInjury',
          colId: 'clientDescriptionOfInjury',
          minWidth: 100,
          sortable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Client Settlement Date',
          field: 'clientSettlementDate',
          colId: 'clientSettlementDate',
          sortable: true,
          cellRenderer: data => this.datePipe.transform(data.value, false),
          ...AGGridHelper.dateTimeColumnDefaultParams,
          ...AGGridHelper.dateColumnFilter(),
        },
        {
          headerName: 'Client Settlement Amount',
          field: 'clientSettlementAmount',
          colId: 'clientSettlementAmount',
          sortable: true,
          resizable: true,
          ...AGGridHelper.getCustomTextColumnFilter(),
          ...AGGridHelper.amountColumnDefaultParams,
          cellRenderer: data => this.toUsdFormat(data.value),
        },
        {
          headerName: 'Lien Date',
          field: 'lienDate',
          colId: 'lienDate',
          sortable: true,
          cellRenderer: data => this.datePipe.transform(data.value, false),
          ...AGGridHelper.dateTimeColumnDefaultParams,
          ...AGGridHelper.dateColumnFilter(),
        },
        {
          headerName: 'Lien Amount',
          field: 'totalLienAmount',
          resizable: true,
          ...AGGridHelper.amountColumnDefaultParams,
          cellRenderer: data => this.toUsdFormat(data.value),
        },
        {
          headerName: 'Audited Amount',
          sortable: true,
          field: 'lienAmount',
          colId: 'lienAmount',
          cellRenderer: data => this.toUsdFormat(data.value),
          ...AGGridHelper.amountColumnDefaultParams,
        },
        {
          headerName: 'Tort',
          sortable: true,
          field: 'tortName',
          ...AGGridHelper.getCustomTextColumnFilter(),
        },
        {
          headerName: 'Code Set ID',
          field: 'medicalCodeSetId',
          width: 50,
          sortable: true,
          resizable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        },
        {
          headerName: 'Audit Protocol ID',
          field: 'auditProtocolId',
          width: 50,
          sortable: true,
          resizable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        },
        {
          headerName: 'Result',
          field: 'previewStatusId',
          autoHeight: true,
          wrapText: true,
          sortable: true,
          ...AGGridHelper.getMultiselectDropdownColumnFilter({ options: this.resultOpts }),
          maxWidth: 175,
          cellRenderer: data => AuditValidationResultTypes[data.value],
        },
        AGGridHelper.getActionsColumn({ downloadHandler: this.export.bind(this) }, 70, true),
      ],
      defaultColDef: {
        ...AGGridHelper.defaultGridOptions.defaultColDef,
        floatingFilter: true,
      },
      components: { buttonRenderer: AuditClaimsActionsRendererComponent },
    };
  }

  isPreviewResultDisabled: boolean = true;
  isAuditResultDisabled: boolean = true;

  private actionBar: ActionHandlersMap = {
    back: { callback: () => this.cancel() },
    exporting: { hidden: () => !this.isExporting },
    clearFilter: this.clearFilterAction(),
    actions: {
      options: [
        {
          name: 'Download Preview Results',
          disabled: () => this.isPreviewResultDisabled,
          callback: () => this.downloadPreviewResults(),
        },
        {
          name: 'Download Results',
          disabled: () => this.isAuditResultDisabled || this.isExporting,
          callback: () => this.downloadResults(),
        },
      ],
    },
  };

  public auditDetailsHeader$ = this.store.select(selectors.auditDetailsHeader);

  constructor(
    public store: Store<AppState>,
    private readonly ssnPipe: SsnPipe,
    private readonly datePipe: DateFormatPipe,
    protected router: Router,
    protected elementRef: ElementRef,
    private pusher: PusherService,
    private readonly changeRef: ChangeDetectorRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.resultOpts = [
      { id: AuditBatchUploading.Completed, name: AuditValidationResultTypes[AuditBatchUploading.Completed] },
      { id: AuditBatchUploading.CompletedWithErrors, name: AuditValidationResultTypes[AuditBatchUploading.CompletedWithErrors] },
      { id: AuditBatchUploading.Warning, name: AuditValidationResultTypes[AuditBatchUploading.Warning] },
    ];
    this.setGrid();

    this.auditDetailsHeader$
      .pipe(
        filter((auditRun: AuditRun) => !!auditRun),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((auditRun: AuditRun) => {
        this.auditRun = auditRun;

        this.setResultDisability();

        if (this.gridParams) {
          this.fetchData(this.gridParams);
        }
      });

    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      this.changeRef.detectChanges();
    }

    this.store.dispatch(auditorActions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;

    const key = 'auditRunId';
    const keyIndex = this.gridParams.request.filterModel.findIndex(i => i.key === key);
    if (keyIndex !== -1) {
      this.gridParams.request.filterModel[keyIndex].filter = this.auditRun.id;
    } else {
      this.gridParams.request.filterModel.push(new FilterModel({
        filter: this.auditRun.id,
        filterType: FilterTypes.Number,
        key,
        type: 'equals',
      }));
    }

    const resultStatusKey = 'resultStatusId';
    const resultStatusIndex = this.gridParams.request.filterModel.findIndex(i => i.key === resultStatusKey);
    if (resultStatusIndex !== -1) {
      this.gridParams.request.filterModel[resultStatusIndex].filterType = FilterTypes.Number;
    }

    const includeEmptyLienKey = 'includeEmptyLien';
    const includeEmptyLienIndex = this.gridParams.request.filterModel.findIndex(i => i.key === includeEmptyLienKey);
    if (includeEmptyLienIndex !== -1) {
      this.gridParams.request.filterModel[includeEmptyLienIndex].filter = false;
    } else {
      this.gridParams.request.filterModel.push(new FilterModel({
        filter: false,
        filterType: FilterTypes.Boolean,
        key: includeEmptyLienKey,
        type: 'equals',
      }));
    }

    this.store.dispatch(auditDetailsActions.GetAuditClaimsList({ agGridParams: this.gridParams }));
  }

  public reloadGrid(): void {
    this.store.dispatch(auditDetailsActions.GetAuditClaimsList({ agGridParams: this.gridParams }));
  }

  public cancel(): void {
    this.store.dispatch(GotoParentView());
  }

  public updateActionBar(): void {
    this.actionBar = {
      back: { callback: () => this.cancel() },
      exporting: { hidden: () => !this.isExporting },
      clearFilter: this.clearFilterAction(),
      actions: {
        options: [
          {
            name: 'Download Preview Results',
            disabled: () => this.isPreviewResultDisabled,
            callback: () => this.downloadPreviewResults(),
          },
          {
            name: 'Download Results',
            disabled: () => this.isAuditResultDisabled || this.isExporting,
            callback: () => this.downloadResults(),
          },
        ],
      },
    };
  }

  private setResultDisability(): void {
    const auditRun = this.auditRun;
    if (auditRun) {
      if (auditRun.isPreview) {
        this.isPreviewResultDisabled = !auditRun.resultDocument?.id;
        this.isAuditResultDisabled = true;
      } else {
        this.isPreviewResultDisabled = !auditRun.previewDocument?.id;
        this.isAuditResultDisabled = !auditRun.resultDocument?.id;
      }
    } else {
      this.isAuditResultDisabled = true;
      this.isPreviewResultDisabled = true;
    }
  }

  private downloadPreviewResults(): void {
    const id = this.auditRun[this.auditRun.isPreview ? 'resultDocument' : 'previewDocument'].id;
    this.store.dispatch(DownloadDocument({ id }));
  }

  private downloadResults(): void {
    this.store.dispatch(DownloadDocument({ id: this.auditRun.resultDocument.id }));
  }

  private export(data): void {
    if (data?.filePath?.includes('elastic.com?batchId')) {
      if (this.isExporting) {
        return;
      }
      this.exportAuditDetails(data.resultDocumentId);
    } else {
      this.store.dispatch(DownloadDocument({ id: data.resultDocumentId }));
    }
  }

  private exportAuditDetails(id: number): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportAuditDetails);

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      Object.keys(ExportLoadingStatus).filter(key => !isNaN(Number(ExportLoadingStatus[key.toString()]))),
      this.exportClientsListCallback.bind(this),
      () => {
        this.store.dispatch(auditDetailsActions.ExportAuditDetails({
          id,
          channelName,
        }));
        this.isExporting = true;
        this.updateActionBar();
        this.store.dispatch(auditorActions.UpdateActionBar({ actionBar: this.actionBar }));
      },
    );
  }

  private exportClientsListCallback(data, event): void {
    this.store.dispatch(auditorActions.UpdateActionBar({ actionBar: this.actionBar }));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.isExporting = false;
        this.updateActionBar();
        this.store.dispatch(DownloadDocument({ id: data.docId }));
        this.reloadGrid();
        break;
      case ExportLoadingStatus.Error:
        this.isExporting = false;
        this.updateActionBar();
        this.store.dispatch(auditDetailsActions.Error({ errorMessage: `Error exporting: ${data.message}` }));
        this.reloadGrid();
        break;
      default:
        break;
    }
  }

  private toUsdFormat(data: any): string {
    return data ? CurrencyHelper.toUsdFormat({ value: data.toString().replace(/,/g, '').replace('$', '') }) : '';
  }

  ngOnDestroy(): void {
    this.store.dispatch(auditorActions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
