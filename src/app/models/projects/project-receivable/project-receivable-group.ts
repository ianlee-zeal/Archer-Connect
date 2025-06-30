import { ReceivableItem } from './project-receivable-item';

export interface ReceivableGroup {
  isServiceSpecific: boolean;
  serviceDescription: string;
  serviceName: string;
  serviceId: number;
  receivables: ReceivableItem[];
}
