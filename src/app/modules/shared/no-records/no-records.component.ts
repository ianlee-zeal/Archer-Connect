import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-no-records',
  templateUrl: './no-records.component.html',
  styleUrls: ['./no-records.component.scss'],
})
export class NoRecordsComponent {
  @Input() public showNewRecordLink: boolean;
  @Input() public showByAdvancedSearch: boolean;
  @Input() public noRowsMessage: string;
  @Output() public newRecord: EventEmitter<any> = new EventEmitter();

  public newRecordEmit(): void {
    this.newRecord.emit();
  }
}
