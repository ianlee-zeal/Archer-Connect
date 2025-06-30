import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProjectProductCategory } from '@app/models/scope-of-work';

@Component({
  selector: 'app-product-date',
  templateUrl: 'product-date.component.html',
})
export class ProductDateComponent implements OnInit {
  @Input() canEdit: boolean;
  @Input() productCategory: ProjectProductCategory;
  @Input() control: string;
  @Output() onChange = new EventEmitter();

  date: Date;

  ngOnInit(): void {
    this.date = this.productCategory[this.control];
  }

  public onChangeDate(value: string): void {
    const changedProductCategory = {
      ...this.productCategory,
      [this.control]: new Date(value),
    };

    this.onChange.emit({ productCategory: ProjectProductCategory.toModel(changedProductCategory), isValidData: true });
  }
}
