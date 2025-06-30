import { Org } from '../org';
import { ServiceSummary } from '../service-summary';

export class ClientLienResolution {
  id: number;
  firstName: string;
  lastName: string;
  ssn: string;
  dob: Date;
  org: Org;
  serviceSummary: ServiceSummary;

  constructor(model?: Partial<ClientLienResolution>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClientLienResolution {
    if (item) {
      return {
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        ssn: item.ssn,
        dob: item.dob,
        org: item.org,
        serviceSummary: item.serviceSummary,
      };
    }
    return null;
  }
}
