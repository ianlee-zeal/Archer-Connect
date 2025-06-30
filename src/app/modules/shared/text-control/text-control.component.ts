import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-text-control',
  templateUrl: './text-control.component.html',
  styleUrls: ['./text-control.component.scss']
})
export class TextControlComponent implements OnInit {
  @Input() text: string;
  @Input() minLength: number = 100;

  isExpanded: boolean;

  get shortText() {
    return this.text && this.text.substr(0, this.minLength) + '...';
  }

  get canExpand() {
    return this.text && this.text.length > this.minLength;
  }

  ngOnInit() {
    this.isExpanded = !this.canExpand;
  }
}
