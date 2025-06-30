import { KeyValue } from '@app/models/key-value';
import { DateHelper } from '@app/helpers/date.helper';
import { IdValue } from './idValue';
import { User } from './user';
import { LienService } from './lien-service';
import { Stage } from './stage';

export class ClaimantDashboardOverviewItem {
  id: number;
  type: IdValue;
  phase: IdValue;
  stage: Stage;
  status: IdValue;
  date: Date;
  age: number;
  assigned: User;
  party: string;
  outcome: string;
  additionalInfo: KeyValue[];

  mailDate: Date;
  resendDate: Date;
  receivedDate: Date;
  fillingStatus: IdValue;
  deficiencyStatus: IdValue;
  packetReviewStatus: IdValue;
  reviewAnalyst: User;
  service: LienService;

  constructor(model?: Partial<ClaimantDashboardOverviewItem>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClaimantDashboardOverviewItem | null {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      type: item.type,
      phase: item.phase,
      stage: Stage.toModel(item.stage),
      status: item.status,
      date: item.changeDate ? DateHelper.toLocalDate(item.changeDate) : null,
      age: item.age,
      assigned: User.toModel(item.assignedUser),
      party: item.responsibleParty,
      outcome: item.outcome,
      additionalInfo: item.additionalInfo ? (<KeyValue[]>item.additionalInfo).sort((a, b) => a.sortOrder - b.sortOrder) : null,
      mailDate: item.mailDate ? DateHelper.toLocalDate(item.mailDate) : null,
      resendDate: item.resendDate ? DateHelper.toLocalDate(item.resendDate) : null,
      receivedDate: item.receivedDate ? DateHelper.toLocalDate(item.receivedDate) : null,
      fillingStatus: item.fillingStatus,
      deficiencyStatus: item.deficiencyStatus,
      packetReviewStatus: item.packetReviewStatus,
      reviewAnalyst: User.toModel(item.reviewAnalyst),
      service: LienService.toModel(item.service),
    };
  }
}
