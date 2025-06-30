/* eslint-disable import/no-cycle */
import { Address } from './address';
import { ProjectOrganization } from './project-organization';

export class ProjectOrganizationItem {
  id: number;
  organizationId: number;
  organizationName: string;
  type: string;
  claimantCount: number;
  defaultType: string;
  defaultPaymentAddress: Address;
  defaultBankAccount: string;
  defaultPaymentMethod: string;
  w9OnFile: boolean;
  parentId: number;
  projectName: string;

  public static toItems(item: ProjectOrganization): ProjectOrganizationItem[] {
    if (!item) return null;

    const items = new Array<ProjectOrganizationItem>();
    const parent = new ProjectOrganizationItem();
    parent.id = item.id;
    parent.organizationId = item.id;
    parent.organizationName = item.name;
    parent.type = item.type;
    parent.claimantCount = item.claimantCount;
    parent.w9OnFile = item.w9OnFile;
    if (item.paymentInstructions && item.paymentInstructions.length) {
      const isOnlyChild = item.paymentInstructions.length === 1;
      item.paymentInstructions.forEach(pi => {
        const child = new ProjectOrganizationItem();
        child.id = parent.id;
        child.organizationId = isOnlyChild ? parent.organizationId : null;
        child.organizationName = parent.organizationName;
        child.type = parent.type;
        child.w9OnFile = parent.w9OnFile;
        child.claimantCount = parent.claimantCount;
        child.projectName = pi.case?.name || '';
        child.defaultType = `${pi.isGlobal ? 'Global: ' : ''}${pi.paymentItemTypeName}`;
        child.defaultPaymentAddress = Address.toModel(pi.address);
        child.defaultBankAccount = pi.bankAccountName;
        child.defaultPaymentMethod = pi.paymentMethod;
        child.parentId = parent.organizationId;
        items.push(child);
      });
    } else {
      items.push(parent);
    }

    return items;
  }
}
