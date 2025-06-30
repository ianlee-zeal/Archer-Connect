import { Hidable } from '@app/modules/shared/_functions/hidable';
import { Device } from './device';

export class UserSettings {
  userId: string;
  token: string;
  userName: string;
  newPassword: string;
  oldPassword: string;
  confirmation: string;
  mfa: string;
  hiddenMfa: string;
  mfaCode: string;
  mfaEnabled: boolean;
  trustedDevices: Device[];
  phoneNumber?: number;

  constructor(model?: Partial<UserSettings>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): UserSettings {
    const hiddenMfa: string = Hidable.hideNumber(item.phone?.toString());

    return {
      hiddenMfa,
      userId: item.userId,
      userName: item.username,
      newPassword: item.newPassword,
      oldPassword: item.oldPassword,
      mfa: item.phone,
      mfaCode: item.mfaCode,
      mfaEnabled: item.twoFactorEnabled,
      trustedDevices: item.devices,
      confirmation: item.confirmation,
      token: item.token,
      phoneNumber: item.phoneNumber,
    };
  }

  public static toDTO(userSettings: UserSettings): any {
    return {
      userName: userSettings.userName,
      newPassword: userSettings.newPassword,
      oldPassword: userSettings.oldPassword,
      phone: userSettings.mfa,
      token: userSettings.token,
      sub: userSettings.userId,
      mfaCode: userSettings.mfaCode,
      devices: userSettings.trustedDevices,
      phoneNumber: userSettings.phoneNumber,
    };
  }
}
