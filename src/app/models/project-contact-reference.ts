import { StringHelper } from '@app/helpers';
import { IdValue } from './idValue';
import { ProjectContact } from './project-contact';

export class ProjectContactReference {
  id: number;
  active: boolean;
  projectContactId: number;
  projectId: number;
  reportCc: boolean;
  invoiceCc: boolean;
  projectContact: ProjectContact;
  contactRole: IdValue;
  deficiencyReportCc: boolean;
  qsfReport: boolean;
  userName: string;
  viewFirstName: string;
  viewLastName: string;
  viewEmail: string;
  viewOrgId: number;
  viewOrgName: string;
  viewPrimaryOrgTypeName: string;
  organizationIdName: string;

  public static toModel(item: any): ProjectContactReference {
    if (item) {
      return {
        projectContact: ProjectContact.toModel(item.caseContact),
        projectId: item.caseId,
        projectContactId: item.caseContactId,
        reportCc: item.reportCc || false,
        invoiceCc: item.invoiceCc || false,
        id: item.id,
        active: item.active,
        contactRole: item.contactRole,
        deficiencyReportCc: item.deficiencyReportCc || false,
        qsfReport: item.qsfReport || false,
        organizationIdName: StringHelper.buildIdName(item.viewOrgId, item.viewOrgName),
        ...item,
      };
    }

    return null;
  }
}

export class ProjectContactReferenceAddEdit {
  id?:number;
  active?: boolean;
  caseContactId: number;
  caseId: number;
  reportCc: number;
  contactRoleId: number;
  invoiceCc: number;
  deficiencyReportCc: boolean;
  qsfReport:boolean;
}
