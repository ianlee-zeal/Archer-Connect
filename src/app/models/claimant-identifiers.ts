import { Org } from './org';
import { ExternalIdentifierType } from './external-identifier-type';

export class ClaimantIdentifier {
  public entityType: string;
  public entityId: number;
  public dataSource: string;
  public organization: Org;
  public externalIdentifierType: ExternalIdentifierType;
  public identifier: string;
  public createdDate: Date;

  public static toModel(item: any): ClaimantIdentifier {
    return {
      entityId: item.entityId,
      entityType: item.entityType?.name,
      dataSource: item.dataSource?.name,
      organization: item.organization,
      externalIdentifierType: item.externalIdentifierType,
      identifier: item.identifier,
      createdDate: item.createdDate,
    };
  }
}
