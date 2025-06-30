import { Auditable } from './auditable';

export class PortalDeficiency extends Auditable {
  id: number;
  clientId: number | null;
  lienId: number | null;
  firstName: string;
  lastName: string;
  attorneyReferenceId : string;
  thirdPartyId: string;
  deficientyCategoryName: string;
  deficiencyTypeId: number;
  deficiencyTypeDisplayName: string;
  notes: string;

  constructor(model?: Partial<PortalDeficiency>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): PortalDeficiency | null {
    if (item) {
      return {
        ...super.toModel(item),
        ...item,
      };
    }
    return null;
  }
}
