import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab-placeholder-no-record',
  template: `
    <app-tab-placeholder text="No Record"></app-tab-placeholder>
  `,
})
export class TabPlaceholderNoRecordComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }
}
