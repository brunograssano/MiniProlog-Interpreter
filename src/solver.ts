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

const copyArgumentsToRule = (headArgs:string[], predicateArgs:string[],queryValues:string[]) : string[] => {
  let copiedArgs :string[] = [];

  for (let i=0; i < headArgs.length; i++){
    for (let j=0; j < predicateArgs.length; j++){
      if(headArgs[i] == predicateArgs[j] && copiedArgs.length < predicateArgs.length){
        copiedArgs.push(queryValues[j] as string);
      }
      if (!headArgs.includes(predicateArgs[j] as string) && copiedArgs.length < predicateArgs.length){
        copiedArgs.push(predicateArgs[j] as string);
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

const initializeVariables = (head: Predicate, body: Predicate[], variableValues : Map<string,string[]>) => {
  body.forEach(function (rule:Predicate) {
    rule.arguments.forEach(function (argument:string) {
      if (!head.arguments.includes(argument)){
        variableValues.set(argument,[]);
      }
    });
  })
}

const initializeArguments = (head: Predicate, query:Predicate, constantValues : Map<string,string>) => {
  head.arguments.forEach(function (name:string,i:number) {
    constantValues.set(name,query.arguments[i] as string)
  })
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
    if(equalArgumentsWithVariable(predicateArgs,query.arguments)){
      predicateArgs.forEach(function (value:string,i:number) {
        let variableName = query.arguments[i] as string;
        if(isVariable(variableName)){
          let valuesOfVariable = variableValues.get(variableName) as string[];
          valuesOfVariable.push(value);
        }
      })
    }
  })

}

const exploreTree = (program: Clause[],clause : Clause,query:Predicate) : boolean =>{
  let variableNames : Map<string,string[]> = new Map();
  let argumentValues : Map<string,string> = new Map();
  initializeVariables(clause.head,clause.body,variableNames);
  initializeArguments(clause.head,query,argumentValues);
  let rule = clause.body[0] as Predicate;
  let ruleArguments = copyArgumentsToRule(clause.head.arguments,rule.arguments,query.arguments);
  let newQuery = {name:rule.name,arguments:ruleArguments};
  if (miniProlog.canProve(program,newQuery)){
    getVariableValues(program,newQuery,variableNames);
  }
  else{
    return false;
  }


  for (let i=1; i < clause.body.length; i++){
    for (let key in variableNames.keys()) {
      for (let value in variableNames.get(key)){
        rule = clause.body[i] as Predicate;
        ruleArguments =

      }
    }




  }

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
      if ((clause.head.name != query.name) || (clause.head.arguments.length != query.arguments.length)){
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

      return exploreTree(program,clause,query);
    })

    return proof.reduce(or,false);
  },
};

export default miniProlog;
