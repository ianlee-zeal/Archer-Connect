export class CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleIds: number[];
  isTwoFactorEnabled: boolean;
  orgId: number;
}
