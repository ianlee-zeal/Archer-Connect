import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';

import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { GridId } from '@app/models/enums/grid-id.enum';
import { PermissionService } from '@app/services';
import { filter, takeUntil, first } from 'rxjs/operators';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { formatCurrency } from '@angular/common';
import { DisbursementGroupButtonsRendererComponent } from '@app/modules/disbursement-groups/renderers/disbursement-group-buttons-renderer';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AppState } from '@app/state';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { LedgerSummary } from '@app/models/closing-statement/ledger-summary';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { CreatePager } from '@app/modules/shared/state/common.actions';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { commonSelectors } from '@shared/state/common.selectors';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';

@Component({
  selector: 'app-ledger-summary',
  templateUrl: './ledger-summary.component.html',
})
export class LedgerSummaryComponent extends ListView {
  private currentClaimantId: number;
  private stages: SelectOption[] = [];
  private stages$ = this.store.select(selectors.ledgerStages);
  private currentClaimant$ = this.store.select(selectors.item);
  public ledgerSummaryGrid$ = this.store.select(selectors.ledgerSummaryGrid);
  readonly pager$ = this.store.select(commonSelectors.pager);

  protected ngUnsubscribe$ = new Subject<void>();

  public editClaimSettlementLedgers = PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Edit);

  public readonly gridId: GridId = GridId.LedgerSummary;
  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 90,
        maxWidth: 90,
        sortable: true,
        resizable: true,
        sort: 'desc',
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Disbursement Group',
        field: 'disbursementGroup.name',
        sortable: true,
        minWidth: 220,
        width: 220,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Ledger Stage',
        field: 'stage.id',
        sortable: true,
        width: 150,
        minWidth: 150,
        cellRenderer: (param: any) => {
          const summary: LedgerSummary = param.data;
          return summary.stage?.name;
        },
        ...AGGridHelper.getDropdownColumnFilter({ options: this.stages }),
      },
      {
        headerName: 'Gross Disbursement',
        sortable: true,
        field: 'grossAllocation',
        cellRenderer: data => formatCurrency(data.value, 'en-US', '$'),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Fee and Expenses',
        sortable: true,
        field: 'feeExpenses',
        cellRenderer: data => formatCurrency(data.value, 'en-US', '$'),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Net Disbursement',
        sortable: true,
        field: 'netAllocation',
        cellRenderer: data => formatCurrency(data.value, 'en-US', '$'),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Firm Approved',
        field: 'isFirmApproved',
        cellRenderer: 'yesNoRenderer',
        sortable: true,
        resizable: false,
        suppressSizeToFit: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        width: 120,
        minWidth: 120,
      },
      {
        headerName: 'Version',
        sortable: true,
        field: 'currentVersion',
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        resizable: false,
        suppressSizeToFit: true,
        width: 80,
        minWidth: 80,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        resizable: false,
        suppressSizeToFit: true,
        width: 100,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateOnlyColumnFilter(),
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        resizable: false,
        suppressSizeToFit: true,
        width: 150,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateOnlyColumnFilter(),
      },
      AGGridHelper.getActionsColumn({
        goToButton: {
          handler: this.goToLedgerDetails.bind(this),
          title: 'Go To Ledger Details',
          permission: this.editClaimSettlementLedgers,
        },
      }),
    ],
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: DisbursementGroupButtonsRendererComponent,
      yesNoRenderer: CheckboxEditorRendererComponent,
    },
    onRowDoubleClicked: this.goToLedgerDetails.bind(this),
  };

  constructor(
    private readonly store: Store<AppState>,
    router: Router,
    elementRef: ElementRef,
    private readonly datePipe: DateFormatPipe,
    private readonly permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: { clearFilter: super.clearFilterAction() } }));
    this.store.dispatch(actions.ToggleClaimantSummaryBar({ isExpanded: true }));

    this.currentClaimant$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(claimant => {
        this.currentClaimantId = claimant.id;
        this.store.dispatch(actions.GetLedgerSummaryGrid({ clientId: this.currentClaimantId }));
      });

    this.stages$.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(stages => {
        if (stages) {
          this.stages.push(...stages);
        } else {
          this.store.dispatch(actions.GetLedgerStages());
        }
      });
  }

  public fetchData(): void {}

  protected goToLedgerDetails({ data }): void {
    if (this.permissionService.has(this.editClaimSettlementLedgers)) {
      this.pager$.pipe(
        first(),
      ).subscribe(pager => {
        const rowData = [];
        this.gridApi.getRenderedNodes().forEach(node => rowData.push(node.data));

        const payload: actions.ILedgerSummaryPagerPayload = {
          data: rowData,
          parentPage: pager ? pager.relatedPage : RelatedPage.ClaimantsFromSearch,
        };

        const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
        this.store.dispatch(
          CreatePager({
            relatedPage: RelatedPage.LedgerSummary,
            settings: navSettings,
            pager: { payload },
          }),
        );
        const claimantDetailsRequest: ClaimantDetailsRequest = { id: this.currentClaimantId, gridParamsRequest: null };
        this.store.dispatch(actions.SetClaimantDetailsRequest({ claimantDetailsRequest }));
        this.store.dispatch(actions.GotoLedgerDetails({ claimantId: this.currentClaimantId, ledgerId: data.id }));
      });
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
