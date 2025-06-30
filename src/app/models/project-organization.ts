// eslint-disable-next-line import/no-cycle
import { PaymentPreferencesItem } from './payment-preferences-item';

export class ProjectOrganization {
  id: number;
  name: string;
  type: string;
  claimantCount: number;
  w9OnFile: boolean;
  paymentInstructions: PaymentPreferencesItem[];
  projectName: string;

  public static toModel(item: any): ProjectOrganization {
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      type: item.type,
      claimantCount: item.claimantCount,
      w9OnFile: item.w9OnFile,
      paymentInstructions: item.paymentInstructions.map(PaymentPreferencesItem.toModel),
      projectName: item.projectName,
    };
  }

  public static toDto(item): any {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        claimantCount: item.claimantCount,
        w9OnFile: item.w9OnFile,
        paymentInstructions: item.paymentInstructions.items.map(PaymentPreferencesItem.toDto),
        projectName: item.projectName,
      };
    }
    return undefined;
  }
}
