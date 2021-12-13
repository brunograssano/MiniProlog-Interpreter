import { MiniProlog } from './MiniProlog';

const A_IN_UNICODE = 65, Z_IN_UNICODE = 90;

type Variable = {
  value: string;
  testedPath: boolean;
}

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

const equalArgumentsWithVariable = (predicateArgs: string[], query: Predicate, tree: Clause[]) : boolean => {
  let equalArgs = false;
  let i = 0;
  while(!equalArgs && i < predicateArgs.length){
    if (isVariable(query.arguments[i] as string)){
      let variableName = query.arguments[i];
      query.arguments[i] = predicateArgs[i] as string;
      equalArgs ||= miniProlog.canProve(tree,query);
      query.arguments[i] = variableName as string;
    }
    i++
  }
  return equalArgs;
}

const getValueForVariable = (variables:Variable[]) : string => {
  let foundOne : boolean = false;
  let i : number = 0;
  let variableValue : string = "";
  while (!foundOne && i < variables.length){
    let variable = variables[i] as Variable;
    if(!variable.testedPath){
      variableValue = variable.value;
      variable.testedPath = true
      foundOne = true;
    }
    i++;
  }

  return variableValue;
}

const copyArgumentsToRule = (rule : Predicate,argumentValues : Map<string,string>,variableNames : Map<string,Variable[]> ) : string[] => {
  let copiedArgs :string[] = [];
  rule.arguments.forEach(function (argument:string) {
    if (argumentValues.has(argument)){
      copiedArgs.push(argumentValues.get(argument) as string)
    }
    else if(variableNames.has(argument)){
      let variableValues = variableNames.get(argument) as Variable[];
      if(variableValues.length == 0){
        copiedArgs.push(argument)
      }
      else{
        copiedArgs.push(getValueForVariable(variableValues))
      }
    }

  })

  return copiedArgs;
}

const or = (truthValue:boolean, currentTruthValue:boolean) : boolean => {
  return truthValue || currentTruthValue;
}

const hasVariables = (query: Predicate) : boolean => {
  return query.arguments.some(isVariable)
}

const initializeVariables = (head: Predicate, body: Predicate[], variableValues : Map<string,Variable[]>) => {
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

function hasVariableValue(variables: Variable[], value: string) {
  let found = false;
  variables.forEach((variable: Variable) => {
    if(variable.value == value){
      found = true;
    }
  })
  return found;
}

const getVariableValues = (facts: Clause[], query: Predicate, variableValues : Map<string,Variable[]>) => {
  if (!hasVariables(query)){
    return;
  }

  facts.forEach(function (rule:Clause) {
    if (rule.head.name != query.name){
      return;
    }
    let predicateArgs = rule.head.arguments;
    if(equalArgumentsWithVariable(predicateArgs, query,facts )){
      predicateArgs.forEach(function (value:string,i:number) {
        let variableName = query.arguments[i] as string;
        if(isVariable(variableName) && variableValues.has(variableName) && !hasVariableValue(variableValues.get(variableName) as Variable[] ,value)){
          let valuesOfVariable = variableValues.get(variableName) as Variable[];
          valuesOfVariable.push({value:value,testedPath:false});
        }
      })
    }
  })

}

function getNewQuery(rule: Predicate, argumentValues: Map<string, string>, variableNames: Map<string, Variable[]>) {
  let ruleArguments = copyArgumentsToRule(rule, argumentValues, variableNames);
  return {name: rule.name, arguments: ruleArguments};
}

function resetVariablePaths(possibleValuesOfVariable: Variable[]) {
  for (let i = 0; i < possibleValuesOfVariable.length ; i++){
    let variable = possibleValuesOfVariable[i] as Variable;
    variable.testedPath = false;
  }
}

function hasAlternativesLeft(rule: Predicate, variableNames: Map<string, Variable[]>) {
  let hasAnAlternative = false;
  rule.arguments.forEach(function (argument:string) {
    if (variableNames.has(argument)){
      let variable = variableNames.get(argument) as Variable[];
      variable.forEach(function (variable:Variable) {
        if (!variable.testedPath){
          hasAnAlternative = true
        }
      })
    }
  })
  return hasAnAlternative;
}

function checkAlternatives(program: Clause[], rule: Predicate, argumentValues: Map<string, string>, variableNames: Map<string, Variable[]>) : boolean{
  if (!hasAlternativesLeft(rule,variableNames)){
    return false;
  } // todo permutar los valores de forma tal de recorrer el arbol de opciones

  let result = false;
  let newQuery = getNewQuery(rule, argumentValues, variableNames);
  if (miniProlog.canProve(program,newQuery)){
    getVariableValues(program,newQuery,variableNames);
    result = true;
  }

  return checkAlternatives(program,rule, argumentValues, variableNames) || result;
}

function hasVariablesWithMultipleValues(rule: Predicate, variableNames: Map<string, Variable[]>) {
  let hasMultipleOptions = false;
  rule.arguments.forEach(function (argument:string) {
    if (variableNames.has(argument)){
      let variable = variableNames.get(argument) as Variable[];
      if (variable.length > 1){
        hasMultipleOptions = true;
      }
    }
  })
  return hasMultipleOptions;
}

const exploreTree = (facts: Clause[],clause : Clause,query:Predicate) : boolean =>{

  let falseCount : number = 0;
  let variableNames : Map<string,Variable[]> = new Map();
  let argumentValues : Map<string,string> = new Map();
  initializeVariables(clause.head,clause.body,variableNames);
  initializeArguments(clause.head,query,argumentValues);

  for (let i=0; i < clause.body.length; i++){
    let rule = clause.body[i] as Predicate;

    if (variableNames.size == 0){
      let newQuery = getNewQuery(rule, argumentValues, variableNames);
      if (!miniProlog.canProve(facts,newQuery)){
        return false;
      }
    }

    for (let key of variableNames.keys()) {

      let possibleValuesOfVariable = variableNames.get(key) as Variable[];

      if (!rule.arguments.includes(key)){
        continue;
      }

      if (possibleValuesOfVariable.length == 0){
        if(hasVariablesWithMultipleValues(rule,variableNames)){
          let result = checkAlternatives(facts,rule, argumentValues, variableNames);
          if (!result){
            return false;
          }
          continue;
        }

        let newQuery = getNewQuery(rule, argumentValues, variableNames);
        if (miniProlog.canProve(facts,newQuery)){
          getVariableValues(facts,newQuery,variableNames);
          continue;
        }
        return false;
      }

      for (let variableValue in possibleValuesOfVariable){
        let newQuery = getNewQuery(rule, argumentValues, variableNames);
        if (!miniProlog.canProve(facts,newQuery)){
          falseCount++;
        }
      }

      if(falseCount == possibleValuesOfVariable.length){
        return false;
      }
      falseCount = 0;

      resetVariablePaths(possibleValuesOfVariable);
    }

  }

  return true;
}


function keepFacts(program: Clause[]) : Clause[] {
  let tree : Clause[] = [];
  program.forEach(function (clause:Clause) {
    if (clause.body.length == 0){
      tree.push(clause);
    }
  })
  return tree;
}

const miniProlog: MiniProlog<Clause, Predicate> = {
  buildPredicate: (name: string, ...args: string[]): Predicate => {
    return {name:name, arguments:args};
  },

  buildClause: (head: Predicate, ...body: Predicate[]): Clause => {
    return {head,body};
  },

  canProve: (program: Clause[], query: Predicate): boolean => {
    let tree : Clause[] = keepFacts(program);

    let proof = program.map(function(clause:Clause){
      if ((clause.head.name != query.name) || (clause.head.arguments.length != query.arguments.length)){
        return false
      }

      let exactMatch = equalArguments(clause.head.arguments,query.arguments);
      if (exactMatch){
        return exactMatch;
      }

      let equalWithVariable = equalArgumentsWithVariable(clause.head.arguments,query, tree);
      if (equalWithVariable){
        return equalWithVariable;
      }

      if (clause.body.length == 0){
        return false;
      }

      return exploreTree(tree,clause,query);
    })

    return proof.reduce(or,false);
  },
};

export default miniProlog;
