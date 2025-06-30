import { IDictionary } from '@app/models/utils';
import { ReceivableGroup } from './project-receivable-group';

export class ProjectReceivable {
  id: number;
  name: string;
  description: string;
  isExpanded: boolean;
  items: ReceivableGroup[];

  public static toModel(item): ProjectReceivable {
    if (!item) return null;

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      items: item.items,
      isExpanded: true,
    };
  }

  public static toDto(item: IDictionary<number, boolean>): any {
    if (item) {
      return item.items().map(i => ({ id: i.key, checked: i.value }));
    }
    return undefined;
  }
}
