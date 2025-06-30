import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-refund-info-card',
  templateUrl: './refund-info-card.component.html',
  styleUrls: ['./refund-info-card.component.scss'],
})
export class RefundInfoCardComponent implements OnInit{
  @Input() public refundInfo;

  constructor() { }
    ngOnInit(): void {

    }
}
