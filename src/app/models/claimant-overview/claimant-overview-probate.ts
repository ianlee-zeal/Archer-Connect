import { LienService } from '../lien-service';
import { Stage } from '../stage';

export class ClaimantOverviewProbate {
  stage: Stage;
  phaseId: number;
  status: string;
  statusId?: number;
  service: LienService;
  serviceType: string;
  allocation?: number;
  numPayees: number;
  spiExist?: boolean;
  finalDate?: Date;
  percentComplete?: number

  public static toModel(item: any): ClaimantOverviewProbate {
    if (!item) {
      return null;
    }

    return {
      stage: Stage.toModel(item.stage),
      phaseId: item.phaseId,
      status: item.status,
      statusId: item?.statusId,
      service: LienService.toModel(item.service),
      serviceType: item.serviceType,
      allocation: item?.allocation,
      numPayees: item.numPayees,
      spiExist: item?.spiExist,
      finalDate: item?.finalDate,
      percentComplete: item.PercentComplete,
    };
  }
}
