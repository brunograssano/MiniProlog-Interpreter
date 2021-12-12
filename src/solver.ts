import { MiniProlog } from './MiniProlog';

const A_IN_UNICODE = 65, Z_IN_UNICODE = 90;

type Predicate = {
  name: string;
  arguments: string[];
};

type Clause = {
  head: Predicate;
  body: Predicate[];
};

const isVariable = (value:string) : boolean => {
  return value != "" &&  A_IN_UNICODE <= value.charCodeAt(0) && value.charCodeAt(0) <= Z_IN_UNICODE;
}

const equalArguments = (predicateArgs:string[],queryValues:string[]) : boolean => {
  if(predicateArgs.length != queryValues.length){
    return false;
  }
  let equalArgs = true;
  let i = 0;
  while(equalArgs && i < predicateArgs.length){
    if (predicateArgs[i] != queryValues[i]){
      equalArgs = false;
    }
    i++
  }
  return equalArgs;
}

const or = (truthValue:boolean, currentTruthValue:boolean) : boolean => {
  return truthValue || currentTruthValue;
}

const miniProlog: MiniProlog<Clause, Predicate> = {
  buildPredicate: (name: string, ...args: string[]): Predicate => {
    return {name:name, arguments:args};
  },

  buildClause: (head: Predicate, ...body: Predicate[]): Clause => {
    return {head,body};
  },

  canProve: (program: Clause[], query: Predicate): boolean => {
    let proof = program.map(function(clause:Clause){
      let exactMatch = clause.head.name == query.name && equalArguments(clause.head.arguments,query.arguments);
      let result = clause.body.map(function(rule:Predicate){
        if (rule.name != query.name){
          return false;
        }
        return rule.arguments == query.arguments; // todo
      });
      return result.reduce(or,exactMatch);
    })

    return proof.reduce(or,false);
  },
};

export default miniProlog;
