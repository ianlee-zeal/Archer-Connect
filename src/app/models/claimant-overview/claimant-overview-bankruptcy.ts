import { LienService } from '../lien-service';
import { Stage } from '../stage';

export class ClaimantOverviewBankruptcy {
  stage: Stage;
  phaseId: number;
  status: string;
  statusId?: number;
  service: LienService;
  allocation?: number;
  finalDate?: Date;
  abandoned: boolean;
  closingStatementNeeded: boolean;
  readyToPayTrustee: boolean;
  spiExist?: boolean;
  trusteeAmount: string;
  attorneyAmount: string;
  claimantAmount: string;
  percentComplete: number;
  bkFee: string;

  public static toModel(item: any): ClaimantOverviewBankruptcy {
    if (!item) {
      return null;
    }

    return {
      stage: Stage.toModel(item.stage),
      phaseId: item.phaseId,
      status: item.status,
      statusId: item.statusId,
      service: LienService.toModel(item.service),
      allocation: item.allocation,
      finalDate: new Date(item.finalDate),
      abandoned: item.abandoned,
      closingStatementNeeded: item.closingStatementNeeded,
      readyToPayTrustee: item.readyToPayTrustee,
      spiExist: item.spiExist,
      trusteeAmount: item.trusteeAmount,
      attorneyAmount: item.attorneyAmount,
      claimantAmount: item.claimantAmount,
      percentComplete: item.percentComplete,
      bkFee: item.bkFee,
    };
  }
}
