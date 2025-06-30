export class DocumentBatch {

  id: number;
  orgId: number;
  orgName: string;
  caseId: number;
  caseName: string;
  statusId: number;
  statusName: string;
  batchDescription: string;
  jitBitData: string;
  jitbitDataDateTime: Date;
  ticketStatusId: number;
  ticketStatusName: string;
  sharepointData: string;
  departmentId: number;
  departmentNames: string[];
  departmentNamesCsv: string;
  createdDate: Date;
  createdByUserId: number;
  createdByFullName: string;
  createdByFirstName: string;
  createdByLastName: string;
  numberOfDocumentsInBatch: number;
  sizeOfBatchInBytes: number;

  constructor(model?: Partial<DocumentBatch>) {
    Object.assign(this, model);
  }

  public static toModel(item: DocumentBatch): DocumentBatch | null {
    if (item) {
      return {
        id: item.id,
        orgId: item.orgId,
        orgName: item.orgName,
        caseId: item.caseId,
        caseName: item.caseName,
        statusId: item.statusId,
        statusName: item.statusName,
        batchDescription: item.batchDescription,
        jitBitData: item.jitBitData,
        jitbitDataDateTime: item.jitbitDataDateTime,
        ticketStatusId: item.ticketStatusId,
        ticketStatusName: item.ticketStatusName,
        sharepointData: item.sharepointData,
        departmentId: item.departmentId,
        departmentNames: item.departmentNames,
        departmentNamesCsv: item.departmentNamesCsv,
        createdDate: item.createdDate,
        createdByUserId: item.createdByUserId,
        createdByFullName: item.createdByFullName,
        createdByFirstName: item.createdByFirstName,
        createdByLastName: item.createdByLastName,
        numberOfDocumentsInBatch: item.numberOfDocumentsInBatch,
        sizeOfBatchInBytes: item.sizeOfBatchInBytes,
      };
    }
    return null;
  }
}