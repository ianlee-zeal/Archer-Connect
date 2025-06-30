import { IdValue } from './idValue';

export class InjuryEvent {
  id: number;
  startDate: Date;
  injuryEventType: IdValue;

  description: string;
  clientIds?: number[];

  constructor(model?: Partial<InjuryEvent>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): InjuryEvent {
    return {
      id: item.id,
      startDate: item.startDate,
      injuryEventType: item.injuryEventType,
      description: item.description,
    };
  }

  public static toDto(item: InjuryEvent): any {
    return {
      id: item.id,
      startDate: item.startDate,
      injuryEventType: item.injuryEventType,
      description: item.description,
    };
  }
}
