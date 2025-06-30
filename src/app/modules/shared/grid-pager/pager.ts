import { RelatedPage } from './related-page.enum';

export interface Pager {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  entityLabel: string;
  payload?: any;
  relatedPage?: RelatedPage;
  isForceDefaultBackNav: boolean; // back button logic works according to relatedPage value. We can force to use default back nav using this flag.
}
