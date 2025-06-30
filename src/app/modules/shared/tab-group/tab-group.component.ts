import { Component, ContentChildren, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { TabItemComponent } from '../tab-item/tab-item.component';

@Component({
  selector: 'app-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrls: ['./tab-group.component.scss'],
})
export class TabGroupComponent implements AfterViewInit {
  @Output() tabChanged = new EventEmitter();
  @Output() viewInitialized = new EventEmitter();
  @ContentChildren(TabItemComponent) tabs;

  public onActivate(component): void {
    this.tabChanged.emit(component);
  }

  public ngAfterViewInit(): void {
    this.viewInitialized.emit();
  }
}
