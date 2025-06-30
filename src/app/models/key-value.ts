import { KeyValuePair } from './utils';
import { DataType } from './enums/data-type.enum';

export interface KeyValue extends KeyValuePair<string, string> {
  sortOrder?: number;
  dataType?: DataType;
}
