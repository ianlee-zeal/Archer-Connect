import { IdValue } from '../idValue';

export class ProjectMessage {
  id: number;
  customMessage: string;
  messageType: IdValue;
  sectionType: IdValue;

  public static toModel(item: any): ProjectMessage {
    if (item) {
      return {
        id: item.id,
        customMessage: item.customMessage,
        messageType: item.messageType,
        sectionType: item.sectionType,
      };
    }

    return null;
  }
}
