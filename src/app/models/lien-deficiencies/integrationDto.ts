import { User } from '@app/models';

export class IntegrationDto {
  channelName: string;
  active: boolean;
  integrationTypeId: number;
  id: number;
  createdBy: User;
  createdDate: Date;

  static toModel(item: IntegrationDto | any) : IntegrationDto | null {
    if (item) {
      return {
        ...item,
        createdBy: item.createdBy ? User.toModel(item.createdBy) : null,
        createdDate: item.createdDate ? new Date(item.createdDate) : null,
      };
    }

    return null;
  }

  static toInitial(item: IntegrationDto | any) : IntegrationDto {
    return {
      ...item,
      channelName: item.channelName || null,
      active: true,
      integrationTypeId: 5,
    };
  }
}
