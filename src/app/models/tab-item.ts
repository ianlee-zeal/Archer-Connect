import { Observable } from 'rxjs';

export class TabItem {
  id?: number;
  title: string;
  link: string;
  count?: Observable<number>;
  countToolTip?: Observable<string>;
  active?: boolean | null;
  inactive?: boolean | null;
  disabled?: boolean | null;
  permission?: string | null;
  iconPath?: string | null;
}
