import { replacementRulesMap } from './support/custom-selectors/replacement-rules';

console.info('Pseudo-Selectors List:');
for (let pseudoSelector in replacementRulesMap) {
  console.log(`- ${pseudoSelector}`);
}
