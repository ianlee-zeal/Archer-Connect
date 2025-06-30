import { Injectable } from '@angular/core';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { Store } from '@ngrx/store';
import { Document, DocumentLink, DocumentType } from '@app/models/documents';

import { DragDropDocumentFormItem } from '@app/models/documents/drag-drop-document-form-item';
import { EntityTypeEnum } from '@app/models/enums';
import { EntityType } from '@app/models/entity-type';
import { TaskDocumentsSaveRequest } from '@app/models/task/task-documents-save-request';
import { DocumentsService } from '../api/documents/documents.service';

@Injectable({ providedIn: 'root' })
export class TaskHelperService {
  constructor(
    private store: Store<ClaimantDetailsState>,
    private documentsService: DocumentsService,
  ) {}

  public getSaveDocumentsList(action) {
    const allOperations = [];
    if (action.documents?.toDelete) {
      action.documents.toDelete.forEach(document => {
        allOperations.push(this.documentsService.deleteDocument(document.id));
      });
    }
    if (action.documents?.toUpdate) {
      action.documents.toUpdate.forEach(document => {
        allOperations.push(this.documentsService.updateDocument(Document.toDto(document), null));
      });
    }
    if (action.documents?.toAdd) {
      action.documents.toAdd.forEach(document => {
        const docToSave = { ...document };
        docToSave.documentLinks[0].entityId = action.taskId;
        allOperations.push(this.documentsService.createDocument(docToSave, docToSave.fileContent));
      });
    }
    return allOperations;
  }

  public getDocumentsToSave(id: number, oldDocumentsList: Document[], newDocumentsList: DragDropDocumentFormItem[]): TaskDocumentsSaveRequest {
    const toAdd = newDocumentsList.filter(d => d.id === 0);
    const toDelete: Document[] = [];
    const toUpdate: Document[] = [];
    oldDocumentsList.forEach(docold => {
      const updatedDoc = newDocumentsList.find(docnew => docnew.id === docold.id);
      if (updatedDoc) {
        if (docold.description !== updatedDoc.description
            || docold.documentTypeId !== updatedDoc.documentTypeId) {
          const doc = docold;
          doc.description = updatedDoc.description;
          doc.documentTypeId = updatedDoc.documentTypeId;
          doc.documentType.id = updatedDoc.documentTypeId;
          toUpdate.push(doc);
        }
      } else {
        toDelete.push(docold);
      }
    });

    const toAddDocuments: Document[] = [];
    toAdd.forEach(document => {
      toAddDocuments.push(new Document({
        id: 0,
        description: document.description,
        documentTypeId: document.documentTypeId,
        documentType: new DocumentType({
          id: document.documentTypeId,
          isActive: true,
        }),
        documentLinks: [new DocumentLink({
          entityId: id,
          entityType: new EntityType({ id: EntityTypeEnum.Tasks }),
          isPublic: false,
        })],
        fileContent: document.file,
        fileNameFull: document.file?.name || document.fileNameFull,
        fileName: document.fileNameFull,
      }));
    });

    return {
      toAdd: toAddDocuments,
      toUpdate,
      toDelete,
    } as TaskDocumentsSaveRequest;
  }
}
