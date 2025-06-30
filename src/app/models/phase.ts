import { Auditable } from './auditable';

export class Phase extends Auditable {
  name: string;
  shortName: string;
  description: string;
  sortOrder: number;
  active: boolean;
  percentComplate: number;
  hexColor: string;
}
