import { DateHelper } from '@app/helpers/date.helper';
import { Org } from '@app/models/org';
import { CommunicationPartyType } from '../enums/communication-party-type.enum';
import { IdValue } from '../idValue';
import { CommunicationRecord } from './communication-record';

export class ProjectCommunicationRecord extends CommunicationRecord {
  projectCommunicationId: number;
  projectContact: IdValue;
  level: IdValue;
  escalationStatus: IdValue;
  resolutionDate: Date;
  resolutionSummary: string;
  sentiment: IdValue;
  businessImpactId: number;
  operationRootCause: string;
  rootCauseCategory: string;
  csTrainingNeeds: string;
  csTrainingNeedsCategory: string;
  csAgentNextActionTracker: string;
  primaryDepartmentResponsibleForFixing: string;
  secondaryDepartmentResponsible: string;
  org: Org;
  orgId: number;
  organizationName: string;
  projectCommunicationPartyTypeName: string;

  constructor(model?: Partial<CommunicationRecord>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): ProjectCommunicationRecord {
    if (item) {
      return {
        ...super.toModel(item),
        projectCommunicationId: item.projectCommunicationId,
        projectContact: item.projectContact,
        level: item.level,
        escalationStatus: item.escalationStatus,
        resolutionDate: DateHelper.toLocalDateWithoutTime(item.resolutionDate),
        resolutionSummary: item.resolutionSummary,
        sentiment: item.sentiment,
        businessImpactId: item.businessImpactId,
        operationRootCause: item.operationalRootCause,
        rootCauseCategory: item.rootCauseCategory,
        csTrainingNeeds: item.csTrainingNeeds,
        csTrainingNeedsCategory: item.csTrainingNeedsCategory,
        csAgentNextActionTracker: item.csAgentNextActionTracker,
        primaryDepartmentResponsibleForFixing: item.primaryDepartmentResponsibleForFixing,
        secondaryDepartmentResponsible: item.secondaryDepartmentResponsible,
        org: item?.org,
        orgId: item.orgId,
        organizationName: item.organizationName,
        projectCommunicationPartyTypeName: item.projectCommunicationPartyTypeName,
      };
    }

    return null;
  }

  public static fromFormValue(entityType, entityId, formValue: any, id?: number): any {
    if (formValue) {
      return {
        ...super.fromFormValue(entityType, entityId, formValue, id),
        callerName: formValue.callerName ? formValue.callerName : '',
        partyTypeId: Number(formValue.partyType) ? Number(formValue.partyType) : CommunicationPartyType.Claimant,
        projectCommunicationId: formValue.projectCommunicationId,
        caseContactId: formValue.projectContact || null,
        projectCommunicationLevelId: formValue.level,
        projectCommunicationSentimentId: formValue.sentiment,
        businessImpact: formValue.businessImpact,
        operationalRootCause: formValue.operationRootCause,
        rootCauseCategory: formValue.rootCauseCategory,
        csTrainingNeeds: formValue.csTrainingNeeds,
        csTrainingNeedsCategory: formValue.csTrainingNeedsCategory,
        csAgentNextActionTracker: formValue.csAgentNextActionTracker,
        primaryDepartmentResponsibleForFixing: formValue.primaryDepartmentResponsibleForFixing,
        secondaryDepartmentResponsible: formValue.secondaryDepartmentResponsible,
        orgId: formValue.organizationId,
        businessImpactId: formValue.businessImpactId,
        otherResults: formValue.otherResults,
        escalationStatusId: formValue.escalationStatusId,
        resolutionDate: formValue.resolutionDate,
        resolutionSummary: formValue.resolutionSummary,
        resultId: formValue.result ?? null,
      };
    }
    return null;
  }
}
