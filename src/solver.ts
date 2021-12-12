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

const equalArgumentsWithVariable = (predicateArgs:string[],queryValues:string[]) : boolean => {
  if(predicateArgs.length != queryValues.length){
    return false;
  }
  let equalArgs = true;
  let i = 0;
  while(equalArgs && i < predicateArgs.length){
    if (predicateArgs[i] != queryValues[i] && !isVariable(queryValues[i] as string)){
      equalArgs = false;
    }
    i++
  }
  return equalArgs;
}

const copyArgumentsToRule = (headArgs:string[], predicateArgs:string[],queryValues:string[],variableNames:Map<string,string[]>) : string[] => {
  let copiedArgs :string[] = [];

  for (let i=0; i < headArgs.length; i++){
    for (let j=0; j < predicateArgs.length; j++){
      if((headArgs[i] == predicateArgs[j] || !headArgs.includes(predicateArgs[j] as string)) &&
          copiedArgs.length < predicateArgs.length){
        copiedArgs.push(queryValues[j] as string);
      }
      if (!headArgs.includes(predicateArgs[j] as string)){
        variableNames.set(queryValues[j] as string,[])
      }
    }
  }
  return copiedArgs;
}

const or = (truthValue:boolean, currentTruthValue:boolean) : boolean => {
  return truthValue || currentTruthValue;
}

const hasVariables = (query: Predicate) : boolean => {
  return query.arguments.some(isVariable)
}

const getVariableValues = (program: Clause[], query: Predicate, variableValues : Map<string,string[]>) => {
  if (!hasVariables(query)){
    return;
  }

  program.forEach(function (rule:Clause) {
    if (rule.head.name != query.name){
      return;
    }
    let predicateArgs = rule.head.arguments;
    if(predicateArgs.length != query.arguments.length){
      return;
    }

    let i = 0;
    while(i < predicateArgs.length){
      if (predicateArgs[i] != query.arguments[i] && isVariable(query.arguments[i] as string)){
        let possibleValues = variableValues.get(query.arguments[i] as string) as string[];
        possibleValues.push(predicateArgs[i] as string)
      }
      i++
    }

  })

}

const exploreTree = (program: Clause[],argumentValues:string[],query:Predicate,variableNames: Map<string,string[]>) : boolean =>{
  variableNames.values()

  return false;
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
      if (clause.head.name != query.name){
        return false
      }

      let exactMatch = equalArguments(clause.head.arguments,query.arguments);
      if (exactMatch){
        return exactMatch;
      }

      let equalWithVariable = equalArgumentsWithVariable(clause.head.arguments,query.arguments);
      if (equalWithVariable){
        return equalWithVariable;
      }

      if (clause.body.length == 0){
        return false;
      }

      let variableNames : Map<string,string[]> = new Map();
      let rule = clause.body[0] as Predicate;
      let ruleArguments = copyArgumentsToRule(clause.head.arguments,rule.arguments,query.arguments,variableNames);
      let newQuery = {name:rule.name,arguments:ruleArguments};
      if (miniProlog.canProve(program,newQuery)){
        getVariableValues(program,newQuery,variableNames);
      }
      else{
        return false;
      }

      return exploreTree(program,clause.head.arguments,query,variableNames);
    })

    return proof.reduce(or,false);
  },
};

export default miniProlog;
