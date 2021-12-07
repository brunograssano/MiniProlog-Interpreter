import { MiniProlog } from './MiniProlog';

type Predicate = {};

type Clause = {};

const miniProlog: MiniProlog<Clause, Predicate> = {
  buildPredicate: (name: string, ...args: string[]): Predicate => {
    return {};
  },

  buildClause: (head: Predicate, ...body: Predicate[]): Clause => {
    return {};
  },

  canProve: (program: Clause[], query: Predicate): boolean => {
    return false;
  },
};

export default miniProlog;
