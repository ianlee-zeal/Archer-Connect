export interface ProjectDto {
  id?: number;
  name?: number;
  typeId?: number;
  assignedUserId?: number;
  settlementId?: number;
  statusId?: number;
  primaryFirmId?: number;
  primaryAttorneyId?: number;
  projectCode?: string;
  tort?: string;
  settlementDate?: Date;
  settlementAmount?: number;
  qsfAdminOrgId?: number;
  qsfOrgId?: number;
  taxIdNumber?: string;
  qsfFundedDate?: Date;
  qsfAdministrator?: string;
  fundName?: string;
  isManagedInAC?: boolean;
  finalStatusLetters?: boolean;
  paymentCoverSheets?: boolean;
  checkTable?: boolean;
  assignedPhoneNumber?: string;
}
