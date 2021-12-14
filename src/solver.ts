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
            copiedArgs.push(argumentValues.get(argument) as string)
        }
        else if(variableNames.has(argument)){
            let variableValue = variableNames.get(argument) as string;
            if(variableValue == ""){
                copiedArgs.push(argument)
            }
            else{
                copiedArgs.push(variableValue)
            }
        }

    })

    return copiedArgs;
}

const or = (truthValue:boolean, currentTruthValue:boolean) : boolean => {
    return truthValue || currentTruthValue;
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

const initializeArguments = (head: Predicate, query:Predicate, constantValues : Map<string,string>) => {
    head.arguments.forEach(function (name:string,i:number) {
        constantValues.set(name,query.arguments[i] as string)
    })
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

const hasVariables = (query: Predicate) : boolean => {
    return query.arguments.some(isVariable)
}

function canProveWithVariables(facts: Clause[], query: Predicate,
                               argumentValues: Map<string, string>, variableNames: Map<string, string>,
                               body: Predicate[], indexBody: number) : boolean {
    if(indexBody > body.length){
        return true;
    }


    let result = facts.map(function (rule:Clause) {
        if (rule.head.name != query.name || rule.head.arguments.length != query.arguments.length){
            return false;
        }

        let equalArgs = true;
        let i = 0;
        while(equalArgs && i < query.arguments.length){
            if (rule.head.arguments[i] != query.arguments[i] && !isVariable(query.arguments[i] as string)){
                equalArgs = false;
            }
            else if (isVariable(query.arguments[i] as string)){
                let variableName = query.arguments[i] as string;
                let newValue = rule.head.arguments[i] as string;
                query.arguments[i] = newValue;

                changeValueInMap(argumentValues, variableNames, variableName, newValue);

                let result = canProveWithVariables(facts,query,argumentValues, variableNames,body,indexBody);
                if(result){
                    return result;
                }

                changeValueInMap(argumentValues, variableNames, variableName, variableName);

                query.arguments[i] = variableName;

            } else if (!hasVariables(query)){

                if (miniProlog.canProve(facts,query)){

                    if (indexBody < body.length){
                        let newQuery = getNewQuery(body[indexBody] as Predicate, argumentValues, variableNames);
                        equalArgs = canProveWithVariables(facts,newQuery,argumentValues, variableNames,body,indexBody+1);
                        if(equalArgs){
                            return equalArgs;
                        }
                    }
                    else {
                        return true;
                    }

                } else{
                    equalArgs = false;
                }
            }

            i++
        }

        if(i >= query.arguments.length){
            equalArgs = false;
        }

        return equalArgs;
    })

    return result.reduce(or);

}


const exploreTree = (facts: Clause[],clause : Clause,query:Predicate) : boolean =>{

    let variableNames : Map<string,string> = new Map();
    let argumentValues : Map<string,string> = new Map();
    initializeVariables(clause.head,clause.body,variableNames);
    initializeArguments(clause.head,query,argumentValues);

    let rule = clause.body[0] as Predicate;
    let newQuery = getNewQuery(rule, argumentValues, variableNames);

    return canProveWithVariables(facts,newQuery,argumentValues, variableNames,clause.body,1);
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

            if (!hasVariables(query) && clause.body.length == 0){
                return equalArguments(clause.head.arguments,query.arguments);
            }

            if (clause.body.length == 0){
                return equalArgumentsWithVariable(clause.head.arguments,query, program);;
            }

            return exploreTree(program,clause,query);
        })

        return proof.reduce(or,false);
    },
};

export default miniProlog;
