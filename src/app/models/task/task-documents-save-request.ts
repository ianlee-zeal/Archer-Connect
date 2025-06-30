import { Document } from '@app/models/documents';

export interface TaskDocumentsSaveRequest {
  toAdd: Document[];
  toDelete: Document[];
  toUpdate: Document[];
}
