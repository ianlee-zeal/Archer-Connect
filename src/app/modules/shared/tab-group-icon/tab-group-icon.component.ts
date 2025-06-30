import { Component, ContentChildren, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { TabItemComponent } from '../tab-item/tab-item.component';

@Component({
  selector: 'app-tab-group-icon',
  templateUrl: './tab-group-icon.component.html',
  styleUrls: ['./tab-group-icon.component.scss'],
})
export class TabGroupIconComponent implements AfterViewInit {
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
