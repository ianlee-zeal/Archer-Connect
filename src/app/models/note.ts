import { ELASTIC_MAX_STRING_LENGTH } from '@app/helpers/constants';
import { EntityTypeEnum } from './enums';
// eslint-disable-next-line import/no-cycle
import { Auditable } from './auditable';

export class Note extends Auditable {
  id: number;
  html: string;
  entityId: number;
  entityTypeId: EntityTypeEnum;
  dataSourceId: number;
  relatedEntityId: number;
  relatedEntityTypeId: EntityTypeEnum;
  isPublic: boolean;

  public static toModel(item): Note {
    if (!item) {
      return null;
    }
    return {
      ...super.toModel(item),
      id: item.id,
      html: item.note,
      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      dataSourceId: item.dataSourceId,
      relatedEntityId: item.relatedEntityId,
      relatedEntityTypeId: item.relatedEntityTypeId,
      isPublic: !item.isInternal,
    };
  }

  public static toDto(item: Note): NoteDto {
    return {
      id: item.id || 0,
      note: item.html,
      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      isInternal: !item.isPublic,
      relatedEntityId: item.relatedEntityId || null,
      relatedEntityTypeId: item.relatedEntityTypeId || null,
    };
  }

  public static validate(item: Note): string {
    if (item?.html?.length > ELASTIC_MAX_STRING_LENGTH) {
      return `Text length exceeds maximum value of ${ELASTIC_MAX_STRING_LENGTH} symbols.`;
    }

    return null;
  }
}

export interface NoteDto {
  id: number;
  note: string;
  entityId: number;
  entityTypeId: EntityTypeEnum;
  isInternal: boolean;
  relatedEntityId?: number;
  relatedEntityTypeId?: number;
}
