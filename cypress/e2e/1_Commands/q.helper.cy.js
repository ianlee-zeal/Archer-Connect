/// <reference types="cypress" />

describe('q-helper', () => {

  it('should be available globally', () => {
    expect(typeof q).equal('function');
  });

  it('should process test-id shortcuts', () => {
    expect(q`%foo`).equal('[data-test-id="foo"]');
    expect(q`%foo %bar`).equal('[data-test-id="foo"] [data-test-id="bar"]');
  });

  it('should process test-* shortcuts', () => {
    expect(q`%(foo=bar,baz=qux)`).equal('[data-test-foo=bar][data-test-baz=qux]');
  });

  it('should process pseudo-selectors', () => {
    expect(q`%%test=baz`).equal('foo[bar=baz] .qux');
    expect(q`%%test="baz"`).equal('foo[bar="baz"] .qux');
  });

});
