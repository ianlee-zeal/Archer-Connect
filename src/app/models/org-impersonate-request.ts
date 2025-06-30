export class OrgImpersonateRequest {
  public orgId: number;
  public orgRoleIds: number[];

  constructor(orgId: number, orgRoleIds: number[]) {
    this.orgId = orgId;
    this.orgRoleIds = orgRoleIds;
  }
}
