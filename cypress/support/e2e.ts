import failOnConsoleError, { Config } from 'cypress-fail-on-console-error';

import './commands';
import { tagAdapter, urlMatcherFactory } from './helpers';
import { parseCustomQuery } from './custom-selectors';

const qHelper = tagAdapter(parseCustomQuery);
const rHelper = tagAdapter(urlMatcherFactory);

///

global.q = qHelper;
global.r = rHelper;

declare global {
  function q(...args: Parameters<typeof qHelper>): ReturnType<typeof qHelper>
  function r(...args: Parameters<typeof rHelper>): ReturnType<typeof rHelper>
}

///

const config: Config = {
  consoleMessages: ['ExpressionChangedAfterItHasBeenCheckedError'],
  consoleTypes: ['error'],
  debug: false,
};

failOnConsoleError(config);
