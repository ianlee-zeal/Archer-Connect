import { SelectOption } from '@shared/_abstractions/base-select';

export interface OptionItem extends SelectOption {
  [key: string]: any;
}