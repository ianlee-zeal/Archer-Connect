import { LienPhase } from './lien-phase';

export class LienPhaseSummary {
  lienCount: number;
  phases: LienPhase[];

  constructor(model?: Partial<LienPhaseSummary>) {
    Object.assign(this, model);
  }
}
