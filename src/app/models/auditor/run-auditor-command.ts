export class RunAuditorCommand {
  auditRunId: number;
  pusherChannelName: string;

  constructor() {}

  public static toDto(item: RunAuditorCommand) {
    return item;
  }
}
