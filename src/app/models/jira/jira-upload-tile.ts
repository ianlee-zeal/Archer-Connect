import { JiraUploadStatus } from "./jira-upload-status";

export interface UploadTile {
  file: File;
  status: JiraUploadStatus;
  fileUploadedId?: string;
  progress?: number;
  errorMessage?: string;
}