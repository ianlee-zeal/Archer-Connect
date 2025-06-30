import { Phase } from './phase';
import { Stage } from './stage';

export class ClientWorkflow {
  id: number;
  stage: Stage;
  phase: Phase;
  lastModifiedDate: Date;
}
