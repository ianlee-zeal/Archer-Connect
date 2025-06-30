type TagFunction = (parts: TemplateStringsArray, values?: any[]) => string;
type PlainFunction = (value: string, options?: any[]) => string;

export function tagAdapter(fn): TagFunction | PlainFunction {
  return function adapter(...args) {
    const [firstArg] = args;

    switch (true) {
      case typeof firstArg === 'string':
        return fn(...args);

      case Array.isArray(firstArg): {
        const [parts, ...values] = args;
        const value = compileTemplateString(parts, values);
        return fn(value);
      }

      default:
        throw `Wrong primary argument`;
    }

  }
}

///

function compileTemplateString(parts: TemplateStringsArray, values: any[] = []): string {
  return parts.reduce(partsReducer, '');

  function partsReducer(res: string, part: string, index: number) {
    return res + part + (values[index] ?? '');
  }
}
