import { HashTable } from '@app/models/hash-table';
import { environment } from 'src/environments/environment';
import { StringHelper } from './string.helper';

export class LPMHelper {
  public static viewInLPM(path: string, queryParams?: HashTable<number>) {
    const endpoint = environment.lpm_url;
    const url = `${endpoint}${path}${StringHelper.queryString(queryParams)}`;
    window.open(url, '_blank');
  }
}
