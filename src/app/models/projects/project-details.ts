import { DateHelper } from '@app/helpers/date.helper';
import { IdValue } from '../idValue';
import { OrgIdNameAlt } from '../orgIdNameAlt';

export class ProjectDetails {
  id: number;
  name: string;
  projectCode: IdValue;
  projectType: IdValue;
  projectStatus: IdValue;
  matter: string;
  tortId: number;
  settlementId: number;
  settlementStatus: string;
  settlementDate: Date;
  settlementAmount: number;
  primaryFirm: IdValue;
  primaryAttorney: IdValue;
  settlement: IdValue;
  qsfAdminOrg: IdValue;
  qsfOrg: OrgIdNameAlt;
  taxIdNumber: string;
  qsfFundedDate: Date;
  qsfcompanyCity: string;
  qsfcompanyState: string;
  qsfcompanyZipCode: string;
  qsfcompanyAddress1: string;
  qsfcompanyAddress2: string;
  qsfAdministrator: string;
  fundName: string;
  isManagedInAC: boolean;
  finalStatusLetters: boolean;
  paymentCoverSheets: boolean;
  checkTable: boolean;
  assignedPhoneNumber: string;

  public static toModel(item: any): ProjectDetails {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        projectCode: item.caseCode,
        projectType: item.caseType,
        projectStatus: item.caseStatus,
        matter: item.tort,
        tortId: item.tortId,
        settlementId: item.settlementId,
        settlementStatus: item.settlementStatus,
        settlementDate: DateHelper.toLocalDate(item.settlementDate),
        settlementAmount: item.settlementAmount,
        primaryFirm: item.primaryFirm,
        primaryAttorney: item.primaryAttorney,
        settlement: item.settlement,
        qsfAdminOrg: item.qsfAdminOrg,
        qsfOrg: item.qsfOrg ? new OrgIdNameAlt(item.qsfOrg.id, item.qsfOrg.name, item.qsfOrg.alternativeName) : null,
        taxIdNumber: item.taxIdNumber,
        qsfFundedDate: DateHelper.toLocalDate(item.qsfFundedDate),
        qsfcompanyCity: item.qsfcompanyCity,
        qsfcompanyState: item.qsfcompanyState,
        qsfcompanyZipCode: item.qsfcompanyZipCode,
        qsfcompanyAddress1: item.qsfcompanyAddress1,
        qsfcompanyAddress2: item.qsfcompanyAddress2,
        qsfAdministrator: item.qsfAdministrator,
        fundName: item.fundName,
        isManagedInAC: item.isManagedInAC,
        finalStatusLetters: item.finalStatusLetters,
        paymentCoverSheets: item.paymentCoverSheets,
        checkTable: item.checkTable,
        assignedPhoneNumber: item.assignedPhoneNumber,
      };
    }

    return null;
  }
}
