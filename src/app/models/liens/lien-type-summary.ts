import { LienType } from './lien-type';

export class LienTypeSummary {
  lienCount: number;
  types: LienType[];

  constructor(model?: Partial<LienTypeSummary>) {
    Object.assign(this, model);
  }
}
