import { FileImportReviewTabs } from '../enums';

export interface FileImportTab {
  tab: FileImportReviewTabs;
  title: string;
  count: number;
}
