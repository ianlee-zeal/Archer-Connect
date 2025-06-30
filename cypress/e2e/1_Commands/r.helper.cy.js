/// <reference types="cypress" />

describe('r-helper', () => {

  it('should be available globally', () => {
    expect(typeof r).equal('function');
  });

  it('should process parameterless patterns', () => {
    expect(r`/foo/bar`.toString()).equal(/^\/foo\/bar$/.toString());
  });

  it('should process glob characters', () => {

    expect(r`/foo/*/bar/**`.test('/foo/fff/bar/xxx/xxx')).equal(true);
    expect(r`/foo/*/bar/**`.test('/foo/fff/ooo/xxx/xxx')).equal(false);

    expect(r`/foo/*/bar/**`.test('xxx/foo/fff/bar/xxx')).equal(false);
    expect(r`**/foo/*/bar/**`.test('xxx/foo/fff/bar/xxx')).equal(true);

    // expect(r`/ba?`.test('/bar')).equal(true);
    // expect(r`/ba?`.test('/baz')).equal(true);
    // expect(r`/ba?`.test('/foo')).equal(false);
    // expect(r`/ba?`.test('/bazz')).equal(false);

  });

  it('should pass positive scenarios', () => {
    const {groups} = '/foo/xxx/bar/123'.match(r`/foo/:fooId/bar/:barId<\\d+>`);
    expect(groups.fooId).equal('xxx');
    expect(groups.barId).equal('123');
  });

  it('should pass negative scenarios', () => {
    const match = '/foo/123/bar/xxx'.match(r`/foo/:fooId/bar/:barId<\\d+>`);
    expect(match).equal(null);
  });

});
