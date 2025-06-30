export class Device {
  userId: string;
  deviceName: string;
  id:string;
  deviceId: string;
  userAgent: string;

  constructor(model?: Partial<Device>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): Device {
    return {
      userId: item.userId,
      id: item.id,
      deviceId: item.deviceId,
      userAgent: item.userAgent,
      deviceName: item.deviceName,
    };
  }
}
