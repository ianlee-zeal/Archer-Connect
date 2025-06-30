export class ActionBarOption {
  name: string;
  class: string;
  callback: Function;
  isDelete?: boolean;
  isFlex?: boolean;

  constructor(model?: Partial<ActionBarOption>) {
    Object.assign(this, model);
  }
}
