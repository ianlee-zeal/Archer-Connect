import { Org } from '../org';

export class ClientProbate {
  id: number;
  firstName: string;
  lastName: string;
  ssn: string;
  dob: Date | null;
  firmName: string;
  totalProducts: number;
  finalizedProducts: number;
  pendingProducts: number;
  clientFinalizedStatus: string;
  product: string;
  org: Org;

  constructor(model?: Partial<ClientProbate>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClientProbate | null {
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
        product: item.product,
        org: item.org,
      };
    }
    return null;
  }
}
