export interface MiniProlog<Clause, Predicate> {
  buildPredicate: (name: string, ...args: string[]) => Predicate;
  buildClause: (head: Predicate, ...body: Predicate[]) => Clause;

  canProve: (program: Clause[], query: Predicate) => boolean;
}
