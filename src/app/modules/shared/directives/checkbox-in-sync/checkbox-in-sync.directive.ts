import { Directive, ElementRef, HostListener, OnInit, Input, OnDestroy } from '@angular/core';

import { HashTable } from '@app/models/hash-table';

const hashTable: HashTable<any[]> = {};

// This directive allows us to bind two or more checkboxes and they will be in sync. If user toggles one of them the rest toggles as well.
@Directive({ selector: 'input[type="checkbox"][checkboxInSync]' })
export class CheckboxInSyncDirective implements OnInit, OnDestroy {
  @Input('checkboxInSync') public identityString: string;

  private nativeElement: any;

  private get checkboxes(): HTMLInputElement[] {
    return hashTable[this.identityString];
  }

  private set checkboxes(value: HTMLInputElement[]) {
    hashTable[this.identityString] = value;
  }

  constructor(
    private element: ElementRef,
  ) { }

  public ngOnInit(): void {
    this.nativeElement = this.element.nativeElement;

    this.checkboxes = this.checkboxes || [];

    if (this.checkboxes.length) {
      this.changeCheckboxValue(this.nativeElement, this.checkboxes[0].checked);
    }

    this.checkboxes.push(this.nativeElement);
  }

  public ngOnDestroy(): void {
    this.checkboxes = this.checkboxes?.filter(input => input === this.nativeElement);
  }

  @HostListener('change', ['$event.target'])
  public onCheckboxChange(target: HTMLInputElement): void {
    const checkboxes = this.checkboxes;

    if (!checkboxes) {
      return;
    }

    checkboxes
      .filter(checkbox => checkbox !== this.nativeElement)
      .forEach((checkbox: HTMLInputElement) => this.changeCheckboxValue(checkbox, target.checked));
  }

  private changeCheckboxValue(checkbox: HTMLInputElement, value: boolean): void {
    if (checkbox.checked === value) {
      return;
    }

    checkbox.checked = value;
    checkbox.dispatchEvent(new Event('change'));
  }
}
