import { ClaimSettlementLedgerEntryStatus, DataToggleState, EntityTypeEnum, FirmPaidStatus, LienPhase, PaymentTypeEnum } from '@app/models/enums';
import { BankruptcyStage } from '@app/models/enums/bankruptcy-stage.enum';
import { ClaimantSummaryStatusEnum } from '@app/models/enums/claimant-summary-status.enum';
import { DeficiencyStageEnum } from '@app/models/enums/deficiency-stage.enum';
import { Stage } from '@app/models/stage';

interface IExtensionMapping {
  csv: string;
  doc: string;
  docx: string;
  pdf: string;
  ppt: string;
  pptx: string;
  xls: string;
  xlsx: string;
  msg: string;
}

const ASSETS_PREFIX = 'assets';

const CHECK_MARK_SYMBOL = '&#9989;';

const extensionMapping: IExtensionMapping = {
  csv: 'ic_txt.svg',
  doc: 'ic_word.svg',
  docx: 'ic_word.svg',
  pdf: 'ic_pdf.svg',
  ppt: 'ic_powerpoint.svg',
  pptx: 'ic_powerpoint.svg',
  xls: 'ic_excel.svg',
  xlsx: 'ic_excel.svg',
  msg: '../images/outlook.png',
};

export class IconHelper {
  public static getIconByEntityType(entityType: EntityTypeEnum): string {
    switch (entityType) {
      case EntityTypeEnum.Projects:
        return IconHelper.getAssetsPath('images/Project.svg');
      case EntityTypeEnum.Clients:
      case EntityTypeEnum.Probates:
        return IconHelper.getAssetsPath('images/Clients.svg');
      case EntityTypeEnum.Payments:
        return IconHelper.getAssetsPath('images/Payments.svg');
      case EntityTypeEnum.Settlements:
        return IconHelper.getAssetsPath('images/Settlement.svg');
      case EntityTypeEnum.Organizations:
        return IconHelper.getAssetsPath('images/Organizations.svg');
      case EntityTypeEnum.Persons:
        return IconHelper.getAssetsPath('images/user.svg');
      case EntityTypeEnum.Documents:
        return IconHelper.getAssetsPath('images/Documents.svg');
      case EntityTypeEnum.GlobalDocumentIntake:
        return IconHelper.getAssetsPath('images/Doc_intake.svg');
      case EntityTypeEnum.Communications:
        return IconHelper.getAssetsPath('images/Default.svg');
      case EntityTypeEnum.Matter:
        return IconHelper.getAssetsPath('images/Matter.svg');
      case EntityTypeEnum.GlobalTemplatesSearch:
        return IconHelper.getAssetsPath('images/Templates.svg');
      case EntityTypeEnum.AuditBatches:
        return IconHelper.getAssetsPath('images/auditor_icon.svg');
      case EntityTypeEnum.Tasks:
        return IconHelper.getAssetsPath('images/task-icon.svg');
      case EntityTypeEnum.DocumentBatch:
        return IconHelper.getAssetsPath('images/Documents.svg');
      case EntityTypeEnum.DefenseDashboard:
        return IconHelper.getAssetsPath('images/Claims.svg');
      case EntityTypeEnum.TortDashboard:
        return IconHelper.getAssetsPath('images/Claims.svg');
      case EntityTypeEnum.GlobalProbateSearch:
        return IconHelper.getAssetsPath('images/Probate.svg');
      case EntityTypeEnum.CommunicationHub:
        return IconHelper.getAssetsPath('images/rectangles-mixed.svg');
      default: return null;
    }
  }

  static getLienPhaseIcon(phase: LienPhase): string {
    switch (phase) {
      case LienPhase.Finalized:
        return IconHelper.getAssetsPath('svg/status-finalized.svg');
      default:
        return IconHelper.getAssetsPath('svg/status-pending.svg');
    }
  }

  static getLienStageIcon(stage: Stage): string {
    if (!stage) {
      return '';
    }

    if (stage.isFinal) {
      return IconHelper.getAssetsPath('svg/status-finalized.svg');
    }

    return IconHelper.getAssetsPath('svg/status-pending.svg');
  }

  static getClaimantSummaryStatusIcon(stage: string): string {
    return stage.includes(ClaimantSummaryStatusEnum.Finalized) && !stage.includes(ClaimantSummaryStatusEnum.Pending)
      ? IconHelper.getAssetsPath('svg/status-finalized.svg')
      : IconHelper.getAssetsPath('svg/status-pending.svg');
  }

  static getClaimantSummaryStatusIconText(stage: string): string {
    return stage.includes(ClaimantSummaryStatusEnum.Finalized) && !stage.includes(ClaimantSummaryStatusEnum.Pending)
      ? ClaimantSummaryStatusEnum.Final
      : ClaimantSummaryStatusEnum.Pending;
  }

  static getSPRWarningIcon(updateDate: Date): string {
    return updateDate ? IconHelper.getAssetsPath('svg/ic_alert.svg') : '';
  }

  static getLienFinalizationIcon(): string {
    return IconHelper.getAssetsPath('images/lien-finalization.svg');
  }

  static getLienDeficienciesIcon(): string {
    return IconHelper.getAssetsPath('images/lien-deficiencies.svg');
  }

  static getSPIStatusIcon(spi: boolean): string {
    return spi ? IconHelper.getAssetsPath('svg/status-finalized.svg') : '';
  }

  static getLienStatusIcon(status: string): string {
    if (status === 'Unknown') {
      return '';
    }

    return status === 'Finalized'
      ? IconHelper.getAssetsPath('svg/status-finalized.svg')
      : IconHelper.getAssetsPath('svg/status-pending.svg');
  }

  static getNetPaidInFullIcon(status: boolean): string {
    return status ? IconHelper.getAssetsPath('svg/status-finalized.svg') : '';
  }

  static getMimeIconByExtension(extension: string): string | null {
    const icon = extensionMapping[extension];

    return icon
      ? IconHelper.getAssetsPath(`svg/${icon}`)
      : null;
  }

  static getSplitTypeIcon(splitTypeId): string {
    switch (splitTypeId) {
      case PaymentTypeEnum.Default:
        return IconHelper.getAssetsPath('images/payment_instruction_default.png');
      case PaymentTypeEnum.Individual:
        return IconHelper.getAssetsPath('images/payment_instruction_special.png');
      case PaymentTypeEnum.Split:
        return IconHelper.getAssetsPath('images/payment_instruction_split.png');
      default:
        return '';
    }
  }

  static getClaimantPaymentIcon(status: number | null): string {
    if (!status) {
      return '';
    }
    switch (status) {
      case ClaimSettlementLedgerEntryStatus.PaymentProcessing:
      case ClaimSettlementLedgerEntryStatus.PartiallyProcessed:
      case ClaimSettlementLedgerEntryStatus.PartiallyPaid:
      case ClaimSettlementLedgerEntryStatus.Paid:
        return IconHelper.getAssetsPath('svg/status-finalized.svg');
      default:
        return IconHelper.getAssetsPath('svg/status-pending.svg');
    }
  }

  static getFirmPaidIcon(status: string): string {
    if (!status) {
      return '';
    }
    switch (status) {
      case FirmPaidStatus.Yes:
        return IconHelper.getAssetsPath('svg/status-finalized.svg');
      case FirmPaidStatus.No:
        return IconHelper.getAssetsPath('svg/status-pending.svg');
      default:
        return '';
    }
  }

  static getWarningIcon(): string {
    return IconHelper.getAssetsPath('images/warning-icon.png');
  }

  static expandCollapseIcon(state: DataToggleState): string {
    return state === DataToggleState.ExpandedAll ? IconHelper.getAssetsPath('images/expand-icon.svg') : IconHelper.getAssetsPath('images/collapse-icon.svg');
  }

  private static getAssetsPath(filePath: string): string {
    return `${ASSETS_PREFIX}/${filePath}`;
  }

  static getBankruptcyStatusIcon(stageId: number): string {
    return (stageId as BankruptcyStage) === BankruptcyStage.Finalized
      ? IconHelper.getAssetsPath('svg/status-finalized.svg')
      : IconHelper.getAssetsPath('svg/status-pending.svg');
  }

  static getBankruptcyStatusIconText(stageId: number): string {
    return (stageId as BankruptcyStage) === BankruptcyStage.Finalized
      ? 'Finalized'
      : 'Pending';
  }

  static getBankruptcyStatusIconByName(stageName: string): string {
    return stageName === "Finalized"
      ? IconHelper.getAssetsPath('svg/status-finalized.svg')
      : IconHelper.getAssetsPath('svg/status-pending.svg');
  }

  static getBankruptcyStatusIconTextByName(stageName: string): string {
    return stageName === "Finalized"
      ? 'Finalized'
      : 'Pending';
  }

  static getPayOnBehalfCheckSymbol(type: EntityTypeEnum): string {
    return type === EntityTypeEnum.ClientContactOnCheck ? CHECK_MARK_SYMBOL : '';
  }

  static getWarningGreyIcon(): string {
    return IconHelper.getAssetsPath('images/lien-deficiencies.svg');
  }

  static getDeficiencyStageIcon(stageId: number): string {
    if (!stageId) {
      return '';
    }
    switch (stageId) {
      case DeficiencyStageEnum.PendingRequest:
        return IconHelper.getAssetsPath('svg/hourglass-half.svg');
      case DeficiencyStageEnum.Requested:
        return IconHelper.getAssetsPath('svg/envelope-circle-check.svg');
      case DeficiencyStageEnum.ResponseReceived:
        return IconHelper.getAssetsPath('svg/inbox-in.svg');
      default:
        return '';
    }
  }
}
