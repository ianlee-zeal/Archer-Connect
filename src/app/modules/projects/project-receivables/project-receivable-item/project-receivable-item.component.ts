import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReceivableItem } from '@app/models/projects/project-receivable/project-receivable-item';

@Component({
  selector: 'app-project-receivable-item',
  templateUrl: './project-receivable-item.component.html',
  styleUrls: ['./project-receivable-item.component.scss'],
})
export class ProjectReceivableItemComponent {
  @Input() public item: ReceivableItem;
  @Output() public checkState = new EventEmitter<boolean>();

  public onCheck(isChecked: boolean) {
    this.checkState.emit(isChecked);
  }
}
