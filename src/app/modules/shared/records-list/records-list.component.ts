import { Component, EventEmitter, Input, Output } from '@angular/core';
import get from 'lodash-es/get';

@Component({
  selector: 'app-records-list',
  templateUrl: './records-list.component.html',
  styleUrls: ['./records-list.component.scss'],
})
export class RecordsListComponent {
  @Input() records: any[] = [];
  @Input() displayProperty: string = 'name';
  @Input() placeholder: string = 'No Records';
  @Output() editClick: EventEmitter<number> = new EventEmitter();
  @Output() addClick: EventEmitter<any> = new EventEmitter();
  @Output() deleteClick: EventEmitter<number> = new EventEmitter();

  public onDeleteClick(index: number): void {
    this.deleteClick.emit(index);
  }

  public onEditClick(index: number): void {
    this.editClick.emit(index);
  }

  public onAddClick(): void {
    this.addClick.emit();
  }

  public getDisplayProperty(r: any): string {
    return get(r, this.displayProperty, '');
  }
}
