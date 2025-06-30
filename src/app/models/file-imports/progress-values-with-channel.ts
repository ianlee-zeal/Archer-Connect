import { GridPusherMessage } from '../documents/grid-pusher-message';
import { BatchActionStatus } from '../enums/batch-action/batch-action-status.enum';

export class ProgressValuesPusherChannel {
  progressValue: string;
  progressWidth: string;
  progressCurrentCount?: number;
  progressTotalCount?: number;
  message: string;
  pusherChannel: string;

  public static toModel(item: GridPusherMessage, pusherChannel: string): ProgressValuesPusherChannel {
    return {
      progressValue: item.CurrentPercentage.toString(),
      progressWidth: `${(item.CurrentPercentage)}%`,
      progressCurrentCount: item.CurrentLoadedCount,
      progressTotalCount: item.Total,
      message: BatchActionStatus[item.StatusId]?.toString(),
      pusherChannel,
    };
  }

  public static initialState(pusherChannel: string): ProgressValuesPusherChannel {
    return {
      progressWidth: '0%',
      progressValue: '0',
      progressCurrentCount: 0,
      progressTotalCount: 0,
      message: 'Retrieving Payment Items',
      pusherChannel,
    };
  }
}
