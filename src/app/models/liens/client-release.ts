import { Org } from '../org';

export class ClientRelease {
  id: number;
  firstName: string;
  lastName: string;
  ssn: string;
  dob: Date
  firmName: string;
  totalProducts: number;
  finalizedProducts: number;
  pendingProducts: number;
  clientFinalizedStatus: string;
  inGoodOrder: boolean;
  deficiencyStatus: string;
  settlementPacketStatus: string;
  org: Org;

  constructor(model?: Partial<ClientRelease>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClientRelease | null {
    if (item) {
      return {
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        ssn: item.ssn,
        dob: item.dob,
        firmName: item.firmName,
        totalProducts: item.totalProducts,
        finalizedProducts: item.finalizedProducts,
        pendingProducts: item.pendingProducts,
        clientFinalizedStatus: item.clientFinalizedStatus,
        inGoodOrder: item.inGoodOrder,
        deficiencyStatus: item.deficiencyStatus,
        settlementPacketStatus: item.settlementPacketStatus,
        org: item.org,
      };
    }
    return null;
  }

}
