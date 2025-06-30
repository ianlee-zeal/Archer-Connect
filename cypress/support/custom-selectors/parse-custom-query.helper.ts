import { replacementRulesMap } from './replacement-rules'

const CUSTOM_ATTR = 'data-test-id';
const CUSTOM_PREFIX = '%';
const CUSTOM_PREFIX_ESCAPED = '\\%';
const PSEUDO_PREFIX = '%%';
const PSEUDO_PREFIX_ESCAPED = '\\%\\%';

export function parseCustomQuery(rawQuery: any): string {
  if (typeof rawQuery !== 'string' ||
    !rawQuery.includes(CUSTOM_PREFIX) && !rawQuery.includes(PSEUDO_PREFIX)) {
    return rawQuery;
  }

  const customSelectorRegExp = new RegExp(
    `${CUSTOM_PREFIX_ESCAPED}([a-z0-9_\\-]+)`,
    'gi'
  );

  const customParamsRegExp = new RegExp(
    `${CUSTOM_PREFIX_ESCAPED}\\(([^)]+)\\)`,
    'gi'
  );

  return (rawQuery.includes(PSEUDO_PREFIX) ? parsePseudoSelectors(rawQuery) : rawQuery)
    .replace(customSelectorRegExp, `[${CUSTOM_ATTR}="$1"]`)
    .replace(customParamsRegExp, paramsReplacer);
}

///

function parsePseudoSelectors(rawQuery: string) {
  const pseudoRegExp = new RegExp(
    `${PSEUDO_PREFIX_ESCAPED}(?<pseudoSelector>[a-z0-9_\-]+)(=(?<name>("[^"]+")|([a-z0-9_\-]+)))?`,
    'gi'
  );

  return rawQuery.replaceAll(pseudoRegExp, pseudoSelectorReplacer);

  ///

  function pseudoSelectorReplacer(...args) {
    const groups = args.at(-1);
    const {pseudoSelector, name} = groups;

    if (name) {
      const selector = replacementRulesMap[`${pseudoSelector}=$name`];
      if (!selector) throw `Unknown pseudo-selector ${pseudoSelector}=$name`;
      return selector.replace('$name', name);
    }

    const selector = replacementRulesMap[pseudoSelector];
    if (!selector) throw `Unknown pseudo-selector ${pseudoSelector}`;
    return replacementRulesMap[pseudoSelector];
  }
}

function paramsReplacer(substring: string, paramsStr: string): string {
  return paramsStr
    .split(',')
    .map(param => param.trim().split('='))
    .reduce(paramsReducer, '');

  ///

  function paramsReducer(result: string, paramsTuple: [string, string]): string {
    const [name, value] = paramsTuple;
    return result + `[data-test-${name}=${value}]`
  }
}
