import { Injectable } from '@angular/core';
import { ChartOfAccount, LedgerAccount, LedgerAccountGroup, LedgerEntry, LedgerInfo } from '@app/models/closing-statement';
import { ChartOfAccountType } from '@app/models/enums/chart-of-account-type.enum';
import { OrgType } from '@app/models/enums/ledger-settings/org-type';
import {
  LedgerAccountGroup as LedgerAccountGroupEnum,
  ClaimSettlementLedgerStages as ClaimSettlementLedgerStagesEnum,
  ChartOfAccountType as ChartOfAccountTypeEnum,
  EntityTypeEnum, ControllerEndpoints,
  DocumentType,
  AttyExpenseNonGrouping,
} from '@app/models/enums';
import { ClosingStatementsSettingsModalComponent } from '@app/modules/claimants/claimant-details/disbursements/closing-statements-settings-modal/closing-statements-settings-modal.component';
import { StageHistoryModalComponent } from '@app/modules/shared/stage-history-modal/stage-history-modal.component';
import { ActivatedRoute } from '@angular/router';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { Store } from '@ngrx/store';
import * as selectors from '@app/modules/claimants/claimant-details/state/selectors';
import * as actions from '@app/modules/claimants/claimant-details/state/actions';
import { filter } from 'rxjs/operators';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { InitialModalState, SaveDocumentGeneratorFilterRequest } from '@app/models/documents/document-generators';
import { SearchOptionsHelper } from '@app/helpers';
import * as dgActions from '@shared/state/document-generation/actions';
import { FormulaSets } from '@app/models';
import { UntypedFormGroup } from '@angular/forms';
import { LedgerSum } from '@app/models/closing-statement/ledger-sum.type';
import { FormulaSetsEnum } from '@app/models/enums/ledger-settings/formula-sets.enum';
import { LogService } from '../log-service';
import { ModalService } from '../modal.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable()
export class ClaimantLedgerService {
  public formulaSet: FormulaSets;
  public readonly percentFractionDigits: number = 8;

  private ledgerId: number;
  private ledgerInfo: LedgerInfo;

  private readonly ledgerInfo$ = this.store.select(selectors.ledgerInfo);

  private readonly expenseAccounts = [
    LedgerAccountGroupEnum.MDL,
    LedgerAccountGroupEnum.CommonBenefit,
    LedgerAccountGroupEnum.AttyExpenses,
    LedgerAccountGroupEnum.ARCHERFees,
    LedgerAccountGroupEnum.OtherFees,
    LedgerAccountGroupEnum.AwardFunding,
    LedgerAccountGroupEnum.Liens,
    LedgerAccountGroupEnum.ThirdPartyPMTS,
  ];

  private readonly creditAccounts = [
    LedgerAccountGroupEnum.AttyFees,
    LedgerAccountGroupEnum.ARCHERFees,
    LedgerAccountGroupEnum.OtherFees,
    LedgerAccountGroupEnum.ThirdPartyPMTS,
    LedgerAccountGroupEnum.MDL,
    LedgerAccountGroupEnum.CommonBenefit,
    LedgerAccountGroupEnum.AttyExpenses,
    LedgerAccountGroupEnum.AwardFunding,
    LedgerAccountGroupEnum.Liens,
  ];

  constructor(
    private store: Store<ClaimantDetailsState>,
    private logger: LogService,
    private modalService: ModalService,
    private route: ActivatedRoute,
  ) {}

  public get hasAccGroups(): boolean {
    return !!this.ledgerInfo?.accountGroups?.length;
  }

  public get isFormuslaSetV2(): boolean {
    return this.ledgerInfo.formulaSetId === FormulaSetsEnum.FormulaSetV2;
  }

  public get projectId(): number {
    return this.ledgerInfo.projectId;
  }

  public initLedgerService(): void {
    this.ledgerId = +(this.route.snapshot?.params?.id || 0);

    this.ledgerInfo$.pipe(
      filter(ledgerInfo => !!ledgerInfo),
    ).subscribe(async ledgerInfo => {
      this.ledgerInfo = ledgerInfo;
    });
  }

  public getExpenseChartsOfAcc(chartOfAccounts: ChartOfAccount[]): Map<string, ChartOfAccount[]> {
    const chartOfAccountMap = new Map<string, ChartOfAccount[]>();

    for (const acc of this.expenseAccounts) {
      if (!chartOfAccountMap?.has(acc)) {
        if (acc == LedgerAccountGroupEnum.AttyExpenses)
          chartOfAccountMap.set(acc, chartOfAccounts.filter(i => i.accountGroupNo === acc && !AttyExpenseNonGrouping.includes(i.accountNo)));
        else
          chartOfAccountMap.set(acc, chartOfAccounts.filter(i => i.accountGroupNo === acc && i.accountType !== ChartOfAccountType.Credit));
      }
    }

    return chartOfAccountMap;
  }

  public getCreditsOfAcc(chartOfAccounts: ChartOfAccount[]): Map<string, ChartOfAccount[]> {
    const chartOfAccountCreditMap = new Map<string, ChartOfAccount[]>();

    for (const acc of this.creditAccounts) {
      if (!chartOfAccountCreditMap.has(acc)) {
        chartOfAccountCreditMap.set(acc, chartOfAccounts.filter(i => i.accountGroupNo === acc && i.accountType === ChartOfAccountType.Credit));
      }
    }

    return chartOfAccountCreditMap;
  }

  public getSpecialAccounts(chartOfAccounts: ChartOfAccount[]): Map<string, ChartOfAccount[]> {
    const specialAccountsMap = new Map<string, ChartOfAccount[]>();

    specialAccountsMap.set(LedgerAccountGroupEnum.AttyExpenses, chartOfAccounts.filter(i => AttyExpenseNonGrouping.includes(i.accountNo)));

    return specialAccountsMap;
  }

  public hasMissingPayeeOrgId(group: LedgerAccountGroup, ledgerInfo: LedgerInfo): boolean {
    let payeeOrgEmtpy = false;
    if (group.accountGroupNo !== LedgerAccountGroupEnum.AttyFees && group.accountGroupNo !== LedgerAccountGroupEnum.AttyExpenses) {
      return false;
    }
    group.accounts?.filter(account=>!AttyExpenseNonGrouping.includes(account.accountNo)).forEach(account => {
      if (account.entries.some(i => !i.payeeOrgId && i.accountType === ChartOfAccountType.Expense)) {
        payeeOrgEmtpy = true;
      }
    });
    const fmm = [ledgerInfo.primaryFirmPaymentOrgTypeId, ledgerInfo.settlementCounselPaymentOrgTypeId, ledgerInfo.referingFirmPaymentOrgTypeId];
    return !fmm.every(i => i === OrgType.PrimaryFirm) && payeeOrgEmtpy;
  }

  public openSettingsModal(): void {
    this.modalService.show(ClosingStatementsSettingsModalComponent, { class: 'wide-modal closing-statements-settings-modal' });
  }

  public openStageHistoryModal(): void {
    this.modalService.show(StageHistoryModalComponent, { initialState: { id: this.ledgerId }, class: 'history-modal' });
  }

  public exportClosingStatement(): void {
    const rowsRequest: IServerSideGetRowsRequestExtended = SearchOptionsHelper
      .getFilterRequest([
        SearchOptionsHelper.getNumberFilter('claimSettlementLedgers.disbursementGroupId', 'number', 'contains', this.ledgerInfo.disbursementGroupId),
        SearchOptionsHelper.getNumberFilter('ledgersStages.id', 'number', 'contains', this.ledgerInfo.stageId),
      ]);

    const clientSearchOptions: IServerSideGetRowsRequestExtended = SearchOptionsHelper
      .getFilterRequest([
        SearchOptionsHelper.getNumberFilter(EntityTypeEnum.Clients.toString(), 'number', 'contains', this.ledgerInfo.clientId),
      ]);

    const clientFilter: SaveDocumentGeneratorFilterRequest = {
      entityId: 0,
      entityTypeId: EntityTypeEnum.Clients,
      searchOptions: clientSearchOptions,
    };

    const caseFilter: SaveDocumentGeneratorFilterRequest = {
      // entityId: 1921,
      entityId: this.ledgerInfo.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      searchOptions: null,
    };

    const gridParams: IServerSideGetRowsParamsExtended = { request: rowsRequest } as IServerSideGetRowsParamsExtended;
    const documentTypes: number[] = [DocumentType.ClosingStatement];
    const initialModalState: InitialModalState = {
      name: `${EntityTypeEnum[EntityTypeEnum.Clients]} ${this.ledgerInfo.clientId} Closing Statement Generation`,
      controller: ControllerEndpoints.Ledgers,
      templateTypes: [EntityTypeEnum.Clients],
      entityTypeId: EntityTypeEnum.Projects,
      entityId: this.ledgerInfo.projectId,
      gridParams,
      documentTypes,
      isSingleExportMode: true,
      defaultTemplateId: this.ledgerInfo.closingStatementInformation.defaultClosingStatementId,
      allowedExtensions: null,
      validOutputTypes: this.ledgerInfo.closingStatementInformation.validOutputTypes,
      defaultFilterRequests: [
        clientFilter,
        caseFilter,
      ],
      disable: !this.ledgerInfo.closingStatementInformation.isClosingStatementReady,
      entityValidationErrors: this.ledgerInfo.closingStatementInformation.entityValidationErrors,
      showWatermark: true,
      finishedProcessCallback: this.publishedClosingStatementGenerationCallback.bind(this),
      stageId: this.ledgerInfo.stageId,
    };
    this.store.dispatch(dgActions.OpenDocumentGenerationModal({ initialModalState }));
  }

  public reloadLedgerInfo(clientId: number): void {
    this.store.dispatch(actions.GetLedgerInfo({
      clientId,
      ledgerId: this.ledgerId,
    }));
  }

  public hasCredits(account: LedgerAccount): boolean {
    return account.accountType === ChartOfAccountType.Credit;
  }

  public isDeductionAccGroup(accGroupNo: string): boolean {
    return accGroupNo !== LedgerAccountGroupEnum.AwardFunding;
  }

  public getLedgerSum(form: UntypedFormGroup): LedgerSum {
    if (!form || !this.hasAccGroups) {
      return { commonAmount: 0, commonPercentage: 0 };
    }

    const { cbfFee, cbfFeeAmount, contractFee, mdlFee } = form.value;
    let commonAmount = 0;
    let commonPercentage = 0;

    // Yeah it's looks expensive.
    // But, since amount of ledger groups is constant value and accounts are pretty much limited too - the complexity is acceptable.
    // Time Complexity is going to be O(groups * accounts * amounts)
    for (const group of this.ledgerInfo.accountGroups) {
      for (const acc of group.accounts) {
        for (const entry of acc.entries) {
          commonAmount = entry.accountType === ChartOfAccountTypeEnum.Credit
            ? commonAmount -= entry.amount || 0
            : commonAmount += entry.amount || 0;
          commonPercentage += entry.percentage || 0;
        }
      }
    }

    // Calc Ledger values
    commonAmount += +cbfFeeAmount || 0;
    commonPercentage += +mdlFee || 0;
    commonPercentage += +cbfFee || 0;
    commonPercentage += +contractFee || 0;

    return { commonAmount, commonPercentage };
  }

  public areEntriesEqual(oldEntries: LedgerEntry[], newEntries: LedgerEntry[]): boolean {
    for (const oldEntry of oldEntries) {
      const newEntry = newEntries.find(i => i.id === oldEntry.id
        && i.uuid === oldEntry.uuid
        && i.chartOfAccountId === oldEntry.chartOfAccountId
        && i.accountGroupNo === oldEntry.accountGroupNo
        && i.accountNo === oldEntry.accountNo
        && i.chartOfAccountId === oldEntry.chartOfAccountId
        && i.payeeOrgId === oldEntry.payeeOrgId) as LedgerEntry;

      if (newEntry == null) {
        return false;
      }

      if (oldEntry.amount !== newEntry.amount || oldEntry.percentage !== newEntry.percentage || oldEntry.description !== newEntry.description) {
        return false;
      }
    }

    return true;
  }

  private publishedClosingStatementGenerationCallback(): void {
    if (this.ledgerInfo.stageId === ClaimSettlementLedgerStagesEnum.CSReady) {
      this.reloadLedgerInfo(this.ledgerInfo.clientId);
    }
  }
}
