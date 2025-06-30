import { EntityType } from '../entity-type';


export class DocumentLink {
  id: number;

  entityId: number;

  entityType: EntityType;

  isPublic: boolean;



  constructor(model?: Partial<DocumentLink>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): DocumentLink {
    return {
      id: item.id,
      entityId: item.entityId,
      entityType: item.entityType,
      isPublic: item.isPublic,
    };
  }
}
