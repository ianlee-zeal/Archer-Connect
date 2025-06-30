import { DocumentBatch } from "@app/models/document-batch-upload/document-batch";
import { SimplifiedDocuments } from "./simplified-documents";

export class DocumentBatchDetailsResponse extends DocumentBatch {
    public documents: SimplifiedDocuments[];
}