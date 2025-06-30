import { LienPhase } from './lien-phase';

export class LienType {
  id: number;
  name: string;
  lienCount: number;

  phases: LienPhase[];
}
