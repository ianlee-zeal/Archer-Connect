import { PermissionActionTypeEnum } from "@app/models/enums"


export interface EmbedReport {
    embedUrl: string,
    reportId: string,
    reportName: string,
}

export interface EmbedToken {
    expiration: string,
    token: string,
    tokenId: string
}

export interface PowerBiConfigModel {
    embedReport: EmbedReport[],
    embedToken: EmbedToken,
    type: string
}

export interface PowerBiProjectPermission {
    projectId: number,
    permissionActionType: PermissionActionTypeEnum
}

export interface PowerBiProjectPermissionsResponse {
    powerBiProjectPermissions: PowerBiProjectPermission[]
}

export const PowerBIEndpoints = {
  TALC_DEFENSE_DASHBOARD: 'embed-info-defense-dashboard-talc',
  TALC_TORT_DASHBOARD: 'embed-info-tort-dashboard-talc',
};
