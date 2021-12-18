import miniProlog from '../src/solver';

const relatives = [
  miniProlog.buildClause(
    miniProlog.buildPredicate('parent', 'alice', 'bob')
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('parent', 'alice', 'charlie'),
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('parent', 'bob', 'dave')
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('grandparent', 'Grandparent', 'Grandchild'),
    miniProlog.buildPredicate('parent', 'Grandparent', 'Middle'),
    miniProlog.buildPredicate('parent', 'Middle', 'Grandchild'),
  ),
];

const booleans = [
  miniProlog.buildClause(
    miniProlog.buildPredicate('and', 'true', 'true', 'true'),
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('and', 'true', 'false', 'false'),
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('and', 'false', 'true', 'false'),
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('and', 'false', 'false', 'false'),
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('or', 'true', 'true', 'true'),
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('or', 'true', 'false', 'true'),
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('or', 'false', 'true', 'true'),
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('or', 'false', 'false', 'false'),
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('not', 'true', 'false')
  ),
  miniProlog.buildClause(
    miniProlog.buildPredicate('not', 'false', 'true')
  ),
];

describe('fact', function() {
  it('exact match', () => {
    const query = miniProlog.buildPredicate('parent', 'alice', 'charlie');
    expect(miniProlog.canProve(relatives, query)).toEqual(true);
  });

  it('exact failure', () => {
    const query = miniProlog.buildPredicate('parent', 'alice', 'dave');
    expect(miniProlog.canProve(relatives, query)).toEqual(false);
  });

  it('variable in first arg match', () => {
    const query = miniProlog.buildPredicate('parent', 'X', 'dave');
    expect(miniProlog.canProve(relatives, query)).toEqual(true);
  });

  it('variable in first arg failure', () => {
    const query = miniProlog.buildPredicate('parent', 'X', 'alice');
    expect(miniProlog.canProve(relatives, query)).toEqual(false);
  });

  it('variable in second arg match', () => {
    const query = miniProlog.buildPredicate('parent', 'alice', 'X');
    expect(miniProlog.canProve(relatives, query)).toEqual(true);
  });

  it('variable in second arg failure', () => {
    const query = miniProlog.buildPredicate('parent', 'charlie', 'X');
    expect(miniProlog.canProve(relatives, query)).toEqual(false);
  });

  it('variable in both args', () => {
    const query = miniProlog.buildPredicate('parent', 'X', 'Y');
    expect(miniProlog.canProve(relatives, query)).toEqual(true);
  });
});

describe('rule without free variables', function() {
  const excludedMiddle = [
    ...booleans,
    miniProlog.buildClause(
      miniProlog.buildPredicate('excluded_middle', 'X', 'NX', 'R'),
      miniProlog.buildPredicate('not', 'X', 'NX'),
      miniProlog.buildPredicate('or', 'X', 'NX', 'R'),
    ),
  ];

  it('can be true', () => {
    const query = miniProlog.buildPredicate('excluded_middle', 'X', 'NX', 'true');
    expect(miniProlog.canProve(excludedMiddle, query)).toEqual(true);
  });

  it('can\'t be false', () => {
    const query = miniProlog.buildPredicate('excluded_middle', 'X', 'NX', 'false');
    expect(miniProlog.canProve(excludedMiddle, query)).toEqual(false);
  });
});

describe('rule with free variable', function() {
  it('exact match', () => {
    const query = miniProlog.buildPredicate('grandparent', 'alice', 'dave');
    expect(miniProlog.canProve(relatives, query)).toEqual(true);
  });

  it('exact failure', () => {
    const query = miniProlog.buildPredicate('grandparent', 'alice', 'bob');
    expect(miniProlog.canProve(relatives, query)).toEqual(false);
  });

  it('variable in first arg match', () => {
    const query = miniProlog.buildPredicate('grandparent', 'X', 'dave');
    expect(miniProlog.canProve(relatives, query)).toEqual(true);
  });

  it('variable in first arg failure', () => {
    const query = miniProlog.buildPredicate('grandparent', 'X', 'charlie');
    expect(miniProlog.canProve(relatives, query)).toEqual(false);
  });

  it('variable in second arg match', () => {
    const query = miniProlog.buildPredicate('grandparent', 'alice', 'X');
    expect(miniProlog.canProve(relatives, query)).toEqual(true);
  });

  it('variable in second arg failure', () => {
    const query = miniProlog.buildPredicate('grandparent', 'bob', 'X');
    expect(miniProlog.canProve(relatives, query)).toEqual(false);
  });

  it('variable in both args', () => {
    const query = miniProlog.buildPredicate('grandparent', 'X', 'Y');
    expect(miniProlog.canProve(relatives, query)).toEqual(true);
  });
});

describe('distributed excluded middle', function() {
  const sat = [
    ...booleans,
    miniProlog.buildClause(
      miniProlog.buildPredicate('sat', 'X', 'Y', 'R'),
      miniProlog.buildPredicate('not', 'X', 'NX'),
      miniProlog.buildPredicate('not', 'Y', 'NY'),
      miniProlog.buildPredicate('and', 'X', 'Y', 'A'),
      miniProlog.buildPredicate('and', 'X', 'NY', 'B'),
      miniProlog.buildPredicate('and', 'NX', 'Y', 'C'),
      miniProlog.buildPredicate('and', 'NX', 'NY', 'D'),
      miniProlog.buildPredicate('or', 'AB', 'CD', 'R'),
      miniProlog.buildPredicate('or', 'A', 'B', 'AB'),
      miniProlog.buildPredicate('or', 'C', 'D', 'CD'),
    ),
  ];

  it('can produce true solutions', () => {
    const query = miniProlog.buildPredicate('sat', 'U', 'V', 'true');
    expect(miniProlog.canProve(sat, query)).toEqual(true);
  });

  it('can\'t produce false solutions', () => {
    const query = miniProlog.buildPredicate('sat', 'U', 'V', 'false');
    expect(miniProlog.canProve(sat, query)).toEqual(false);
  });
});
