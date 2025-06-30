import { Org } from '../org';

export class ClientBankruptcy {
  id: number;
  firstName: string;
  lastName: string;
  ssn: string;
  dob: Date;
  firmName: string;
  totalProducts: number;
  finalizedProducts: number;
  clientFinalizedStatus: string;
  final: boolean;
  finalDate: Date;
  abandoned: boolean;
  org: Org;

  constructor(model?: Partial<ClientBankruptcy>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClientBankruptcy {
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
        clientFinalizedStatus: item.clientFinalizedStatus,
        final: item.final,
        finalDate: item.finalDate,
        abandoned: item.abandoned,
        org: item.org
      };
    }
    return null;
  }
}
