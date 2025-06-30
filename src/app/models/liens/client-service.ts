// eslint-disable-next-line import/no-cycle
import { Org } from '../org';
import { ServiceSummary } from '../service-summary';

export class ClientService {
  id: number;
  archerId: number | null;
  attorneyReferenceId: string;
  firstName: string;
  lastName: string;
  cleanSsn: string;
  dob: Date;
  dateOfDeath: Date | null;
  org: Org;
  serviceSummary: ServiceSummary;
  totalAllocation: number;

  constructor(model?: Partial<ClientService>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClientService {
    if (item) {
      return {
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        cleanSsn: item.cleanSsn,
        dob: item.dob,
        dateOfDeath: item.dod,
        org: item.org,
        serviceSummary: ServiceSummary.toModel(item.serviceSummary),
        archerId: item.archerId,
        totalAllocation: item.totalAllocation,
        attorneyReferenceId: item.attorneyReferenceId,
      };
    }
    return null;
  }
}
