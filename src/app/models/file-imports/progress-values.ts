import { GridPusherLoadedItem } from '../documents/grid-pusher-loaded';

export interface IProgressValues {
  progressValue: string;
  progressWidth: string;
  progressCurrentCount?: number;
  progressTotalCount?: number;
  progressLoadedRows?: GridPusherLoadedItem[];
}
