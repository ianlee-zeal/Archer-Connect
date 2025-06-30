import { DictionaryObject } from '@app/models';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { AbstractControl } from '@angular/forms';

import { StringHelper } from './string.helper';

export class TypeAheadHelper {
  public static get(dictionary: DictionaryObject[], value: string): DictionaryObject {
    const idx = dictionary.findIndex(i => i.name.toLowerCase() == value || i.code.toLowerCase() == value);

    return idx >= 0
      ? dictionary[idx]
      : null;
  }

  public static search = (dictionary: DictionaryObject[], search$: Observable<string>) => search$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => TypeAheadHelper.filterList(term, dictionary)),
  );

  // you should use this method if options for typeahead dropdown are loaded after using this function to avoid empty list of options
  public static searchAsync(optionsGetter: () => DictionaryObject[], search$: Observable<string>) {
    return search$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => TypeAheadHelper.filterList(term, optionsGetter())),
    );
  }

  public static getValidationError(control: AbstractControl, dictionary: DictionaryObject[]) {
    if (typeof control.value !== 'string' || control.value.trim().length === 0)
      return null;

    return !TypeAheadHelper.get(dictionary, control.value.trim().toLowerCase())
      ? { invalidValue: true }
      : null;
  }

  public static serverSearch(searchTermToOptions: (term: string) => Observable<any[]>) {
    return (term$: Observable<string>): Observable<any[]> => term$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => searchTermToOptions(term)),
    );
  }

  private static filterList(term: string, options: DictionaryObject[]) {
    const query = term.trim();

    return options
      .filter(v => StringHelper.isString(v.name) && v.name.toLowerCase().includes(query.toLowerCase()) !== false)
      .map(i => i.name)
      .sort()
      .slice(0, 10);
  }
}
