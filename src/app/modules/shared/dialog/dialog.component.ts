import { Component, ViewEncapsulation, Output, EventEmitter, AfterContentInit, ContentChild, HostListener, Input, ElementRef } from '@angular/core';

import { DialogHeaderComponent } from './dialog-header/dialog-header.component';

@Component({
  selector: 'dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialogComponent implements AfterContentInit {
  @ContentChild(DialogHeaderComponent) public header: DialogHeaderComponent;

  @Output() public close = new EventEmitter<void>();

  private _dismissable: boolean = false;
  @Input()
  set dismissable(value: boolean | string) {
    this._dismissable = (value !== null && value !== 'false');
  }

  get dismissable(): boolean {
    return this._dismissable;
  }

  constructor(private readonly eRef: ElementRef) {}

  public ngAfterContentInit(): void {
    this.header.close = this.close;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !this.dismissable) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.dismissable && !this.eRef.nativeElement.contains(event.target)) {
      this.close.emit();
    }
  }
}
