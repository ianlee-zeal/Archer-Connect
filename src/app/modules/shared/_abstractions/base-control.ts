import { Input, HostBinding, Directive } from '@angular/core';

@Directive()
export class BaseControl {
  @HostBinding('attr.id') public externalId = '';

  @Input()
  public set id(id: string) {
    this._id = id;
    this.externalId = null;
  }

  public get id(): string {
    return this._id;
  }

  private _id: string;
}
