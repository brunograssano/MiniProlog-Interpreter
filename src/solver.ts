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

function isSameArgument(ruleArgument: string, queryArgument: string) {
    return ruleArgument == queryArgument;
}

const hasVariables = (query: Predicate) : boolean => {
    return query.arguments.some(isVariable)
}

function differentRule(rule: Predicate, query: Predicate) {
    return rule.name != query.name || rule.arguments.length != query.arguments.length;
}

const initializeVariables = (head: Predicate, body: Predicate[], variableValues : Map<string,string>) => {
    body.forEach(function (rule:Predicate) {
        rule.arguments.forEach(function (argument:string) {
            if (!head.arguments.includes(argument)){
                variableValues.set(argument,"");
            }
        });
    })
}

const initializeArguments = (head: Predicate, query:Predicate, argumentValues : Map<string,string>) => {
    head.arguments.forEach(function (name:string,i:number) {
        argumentValues.set(name,query.arguments[i] as string)
    })
}

const equalArguments = (predicateArgs:string[],queryValues:string[]) : boolean => {
    let equalArgs = true;
    let i = 0;
    while(equalArgs && i < predicateArgs.length){
        equalArgs = isSameArgument(predicateArgs[i] as string,queryValues[i] as string);
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


const copyArgumentsToRule = (rule : Predicate,argumentValues : Map<string,string>,variableNames : Map<string,string> ) : string[] => {
    let copiedArgs :string[] = [];
    rule.arguments.forEach(function (argument:string) {
        if (argumentValues.has(argument)){
            let argumentValue = argumentValues.get(argument) as string;
            copiedArgs.push(isVariable(argumentValue)?argument:argumentValue);
        }
        else if(variableNames.has(argument)){
            let variableValue = variableNames.get(argument) as string;
            if(variableValue == ""){
                copiedArgs.push(argument);
            }
            else{
                copiedArgs.push(variableValue);
            }
        }

    })

    return copiedArgs;
}

function getNewQuery(rule: Predicate, argumentValues: Map<string, string>, variableNames: Map<string, string>) {
    let ruleArguments = copyArgumentsToRule(rule, argumentValues, variableNames);
    return {name: rule.name, arguments: ruleArguments};
}


function changeValueInMap(argumentValues: Map<string, string>, variableNames: Map<string, string>, variableName: string, newValue: string) {
    if (argumentValues.has(variableName)) {
        argumentValues.set(variableName, newValue)
    } else if (variableNames.has(variableName)) {
        variableNames.set(variableName, newValue)
    }
}

function exploreBranchOfTree(rule: Clause,query: Predicate,
                             argumentValues: Map<string, string>, variableNames: Map<string, string>,
                             facts: Clause[], body: Predicate[], indexBody: number) {

    if (differentRule(rule.head, query)) {
        return false;
    }

    let equalArgs = true;
    let argumentIndex = 0;
    while (equalArgs && argumentIndex < query.arguments.length) {
        if (!isSameArgument(rule.head.arguments[argumentIndex] as string, query.arguments[argumentIndex] as string)
            && !isVariable(query.arguments[argumentIndex] as string)
            && rule.body.length == 0) {
            equalArgs = false;
        } else if (isVariable(query.arguments[argumentIndex] as string) && rule.body.length == 0) {
            let variableName = query.arguments[argumentIndex] as string;
            let newValue = rule.head.arguments[argumentIndex] as string;
            query.arguments[argumentIndex] = newValue;

            changeValueInMap(argumentValues, variableNames, variableName, newValue);

            let result = exploreBranches(facts, query, argumentValues, variableNames, body, indexBody);
            if (result) {
                return result;
            }

            changeValueInMap(argumentValues, variableNames, variableName, variableName);

            query.arguments[argumentIndex] = variableName;

        } else if (!hasVariables(query) || rule.body.length != 0) {

            equalArgs = miniProlog.canProve(facts, query)
            if (equalArgs) {
                if (indexBody < body.length) {
                    let newQuery = getNewQuery(body[indexBody] as Predicate, argumentValues, variableNames);
                    equalArgs = exploreBranches(facts, newQuery, argumentValues, variableNames, body, indexBody + 1);
                    if (equalArgs) {
                        return equalArgs;
                    }
                } else {
                    return true;
                }
            }
        }

        argumentIndex++
    }

    return false;
}

function exploreBranches(facts: Clause[], query: Predicate,
                               argumentValues: Map<string, string>, variableNames: Map<string, string>,
                               body: Predicate[], indexBody: number) : boolean {
    let proved = false;
    let i : number = 0;
    while(i < facts.length && !proved){
        let rule = facts[i] as Clause;
        i++;
        proved = exploreBranchOfTree(rule,query, argumentValues, variableNames, facts, body, indexBody)
    }

    return proved;
}


const exploreTree = (facts: Clause[],clause : Clause,query:Predicate) : boolean =>{
    let variableNames : Map<string,string> = new Map();
    let argumentValues : Map<string,string> = new Map();
    initializeVariables(clause.head,clause.body,variableNames);
    initializeArguments(clause.head,query,argumentValues);

    let rule = clause.body[0] as Predicate;
    let newQuery = getNewQuery(rule, argumentValues, variableNames);

    return exploreBranches(facts,newQuery,argumentValues, variableNames,clause.body,1);
}

const miniProlog: MiniProlog<Clause, Predicate> = {
    buildPredicate: (name: string, ...args: string[]): Predicate => {
        return {name:name, arguments:args};
    },

    buildClause: (head: Predicate, ...body: Predicate[]): Clause => {
        return {head,body};
    },

    canProve: (program: Clause[], query: Predicate): boolean => {

        let proved = false;
        let i : number = 0
        while (i < program.length && !proved){
            let clause = program[i] as Clause;
            i++;
            if (differentRule(clause.head,query)){
                continue;
            }

            if (!hasVariables(query) && clause.body.length == 0){
                proved = equalArguments(clause.head.arguments,query.arguments);
                continue;
            }

            if (clause.body.length == 0){
                proved = equalArgumentsWithVariable(clause.head.arguments,query, program);
                continue;
            }

            proved = exploreTree(program,clause,query);
        }

        return proved;
    },
};

export default miniProlog;
