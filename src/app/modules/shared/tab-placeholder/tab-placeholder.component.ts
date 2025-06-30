import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab-placeholder',
  templateUrl: './tab-placeholder.component.html',
  styleUrls: ['./tab-placeholder.component.scss'],
})
export class TabPlaceholderComponent implements OnInit {
  @Input() public text: string;

  constructor() { }

  ngOnInit() {
  }
}
