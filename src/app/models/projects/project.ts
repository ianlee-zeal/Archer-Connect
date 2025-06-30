/* eslint-disable import/no-cycle */
import { IdValue } from '../idValue';
import { Org } from '../org';
import { User } from '../user';

export class Project {
  id: number;

  name: string;

  matter: string;

  tortId: number;

  organization: Org;

  isPinned: boolean;

  projectCode: number;

  projectType: IdValue | null;

  activeCount: number;

  inactiveCount: number;

  status: IdValue;

  assignedUser: User;

  settlementName: string;

  isManagedInAC: boolean;

  finalStatusLetters: boolean;

  paymentCoverSheets: boolean;

  checkTable: boolean;

  assignedPhoneNumber: string;

  qsfOrgId: number;

  qsfcompanyName: string;

  primaryOrgId?: number;

  constructor(model?: Partial<Project>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): Project {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        matter: item.tort,
        tortId: item.tortId,
        organization: item.organization,
        isPinned: item.isPinned,
        projectCode: item.projectCode,
        projectType: item.caseType,
        activeCount: item.activeCount,
        inactiveCount: item.inactiveCount,
        status: item.status,
        assignedUser: item.assignedUser,
        settlementName: item.settlementName,
        isManagedInAC: item.isManagedInAC,
        finalStatusLetters : item.finalStatusLetters,
        paymentCoverSheets : item.paymentCoverSheets,
        checkTable : item.checkTable,
        assignedPhoneNumber: item.assignedPhoneNumber,
        qsfOrgId: item.qsfOrgId,
        qsfcompanyName: item.qsfcompanyName,
        primaryOrgId: item.primaryOrgId,
      };
    }

    return null;
  }

  public static toDto(item: Project): any {
    return {
      id: item.id,
      name: item.name,
      tort: item.matter,
    };
  }
}
