import { PermissionTypeEnum, EntityTypeEnum, ProductCategory, PermissionActionTypeEnum } from '@app/models/enums';
import { PowerBiProjectPermission } from '@app/services/power-bi-config.model';
export class Policy {

  public static getNotes(entityType: EntityTypeEnum): PermissionTypeEnum {
    switch (entityType) {
      case EntityTypeEnum.Projects: return PermissionTypeEnum.ProjectNotes;
      case EntityTypeEnum.Clients: return PermissionTypeEnum.ClientNotes;
      case EntityTypeEnum.Organizations: return PermissionTypeEnum.OrganizationNotes;
      case EntityTypeEnum.Communications: return PermissionTypeEnum.CommunicationNotes;
      case EntityTypeEnum.ProjectDisbursementNotes: return PermissionTypeEnum.ProjectDisbursementNotes;
      case EntityTypeEnum.Settlements: return PermissionTypeEnum.SettlementNotes;
      case EntityTypeEnum.Matter: return PermissionTypeEnum.MatterNotes;
      case EntityTypeEnum.BankAccounts: return PermissionTypeEnum.BankAccountNotes;
      case EntityTypeEnum.Probates: return PermissionTypeEnum.ClientNotes;

      default: this.throwException(entityType);
    }

    return null;
  }

  public static getDocuments(entityType: EntityTypeEnum): PermissionTypeEnum {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(entityType)) {
      return null;
    }
    switch (entityType) {
      case EntityTypeEnum.Matter: return PermissionTypeEnum.MatterDocuments;
      case EntityTypeEnum.Organizations: return PermissionTypeEnum.OrganizationDocuments;
      case EntityTypeEnum.Communications: return PermissionTypeEnum.ClientCommunicationsDocuments;

      case EntityTypeEnum.Clients:
      case EntityTypeEnum.Probates:
      case EntityTypeEnum.ClientContacts:
      case EntityTypeEnum.ClientContactOnCheck:
        return PermissionTypeEnum.ClientDocuments;

      case EntityTypeEnum.DocumentGeneration: return PermissionTypeEnum.Documents;
      case EntityTypeEnum.Projects: return PermissionTypeEnum.ProjectsDocuments;
      case EntityTypeEnum.Settlements: return PermissionTypeEnum.SettlementDocuments;
      case EntityTypeEnum.Payments: return PermissionTypeEnum.Payments;

      // TODO Temporary value to support already created documents at Documents View.
      // Back-end has same check
      case EntityTypeEnum.LienProducts: return PermissionTypeEnum.Documents;

      case EntityTypeEnum.Tasks: return PermissionTypeEnum.TaskManagement;

      case EntityTypeEnum.IntegrationJob: return PermissionTypeEnum.ReportSettings;

      default: this.throwException(entityType);
    }
    return null;
  }

  public static getAddresses(entityType: EntityTypeEnum): PermissionTypeEnum {
    switch (entityType) {
      case EntityTypeEnum.Persons: return PermissionTypeEnum.PersonAddresses;

      case EntityTypeEnum.Organizations: return PermissionTypeEnum.OrganizationAddresses;

      default: this.throwException(entityType);
    }
    return null;
  }

  public static getLienServices(service: ProductCategory, getProjectSpecificServices: boolean = false): PermissionTypeEnum {
    // only 4 services needs to be displayed
    switch (service) {
      case ProductCategory.MedicalLiens: return PermissionTypeEnum.LienProducts;
      case ProductCategory.Bankruptcy: return PermissionTypeEnum.Bankruptcy;
      case ProductCategory.Probate: return PermissionTypeEnum.ProbateDashboards;
      case ProductCategory.Release: return PermissionTypeEnum.Release;
      // The following service(s) are specific to the Project view.
      // They should not appear when viewed from another view, e.g. Claimant view.
      case ProductCategory.ClaimsAdministration: return getProjectSpecificServices ? PermissionTypeEnum.Claims : null;
    }
    return null;
  }

  public static getLienServiceActions(service: ProductCategory, powerBiProjectPermissions: PowerBiProjectPermission[], projectId?: number): PermissionActionTypeEnum | null {
    // only 4 services needs to be displayed
    if(service == ProductCategory.ClaimsAdministration ) {
      if(powerBiProjectPermissions !== null && projectId !== null) {
        return Policy.getClaimsActionTypeByProject(powerBiProjectPermissions, projectId);
      }
      else {
        return null;
      }
    }
    else {
      return PermissionActionTypeEnum.Read;
    }
  }

  private static getClaimsActionTypeByProject(powerBiProjectPermissions: PowerBiProjectPermission[], projectId: number): PermissionActionTypeEnum | null{
    let powerBiProjectPermission = powerBiProjectPermissions.find((permission: PowerBiProjectPermission) =>
        permission.projectId == projectId
    )
    if(powerBiProjectPermission == null) {
      return null;
    }
    else {
      return powerBiProjectPermission.permissionActionType;
    }
  }

  private static throwException(paramId: number) {
    // eslint-disable-next-line no-console
    console.log(`%c EntityType type is not supported by permissions. ParamId = ${paramId}`, 'background: red; color: white');
  }
}
