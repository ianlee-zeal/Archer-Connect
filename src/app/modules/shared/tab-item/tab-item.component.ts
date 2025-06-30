import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab-item',
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.scss'],
})
export class TabItemComponent {
  @Input() title: string;
  @Input() count: Observable<number>;
  @Input() countToolTip: Observable<string>;
  @Input() active: boolean;
  @Input() disabled: boolean;
  @Input() routerLink: string;
  @Input() permission: string;
  @Input() iconPath?: string;
}
