import { Person } from './person';

export class Lien {
  id: number;
  client: Person; //TODO Or Client?

  constructor(model?: Partial<Lien>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): Lien | null {
    let model: Lien = null;

    if (item) {
      model = {
        id: item.id,
        client: item.client,
      };
    }

    return model;
  }
}
