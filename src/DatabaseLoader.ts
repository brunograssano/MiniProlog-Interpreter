import miniProlog from "./solver";

const fs = require('fs');

const DATABASE_PATH = './database-prolog/padres.txt';

export const validInput = (input: string) : boolean=> {
    let firstPart = input.split('(');
    let name = firstPart[0] as string;
    let argsWithoutSplit = firstPart[1] as string;
    let argsWithoutSplitAndSpaces = argsWithoutSplit.replace(/\s+/g, '');
    let argsWithoutSplitAndSpacesAndParenthesis = argsWithoutSplit.slice(0,argsWithoutSplitAndSpaces.length-1);
    let queryArguments = argsWithoutSplitAndSpacesAndParenthesis.split(',');

    if (firstPart.length != 2 || input.charAt(0) == '('){
        return false;
    }
    if (argsWithoutSplit.split(')').length > 2 || argsWithoutSplitAndSpaces.charAt(argsWithoutSplitAndSpaces.length-1) != ')'){
        return false;
    }
    if(queryArguments.some((arg:string)=>{return arg == "";})){
        return false;
    }
    if(name.replace(/\s+/g, '') == ""){
        return false;
    }
    return true;
}

export const parseInput = (input :string) => {
    let result = input.split('(');
    let name = result[0] as string;
    let argsWithoutSplit = result[1] as string;
    argsWithoutSplit = argsWithoutSplit.slice(0,argsWithoutSplit.length-1).replace(/\s+/g, '');
    let queryArguments = argsWithoutSplit.split(',');
    return miniProlog.buildPredicate(name,...queryArguments)
}

function parseFact(input :string)  {
    if(!validInput(input)){
        console.log("Wrong format in fact: " + input);
        process.exit();
    }
    return parseInput(input);
}

function parseRule(input :string)  {
    let ruleAndBody = input.split(':-');
    if (ruleAndBody.length > 2){
        console.log("Wrong rule format: " + input);
        process.exit();
    }
    let name = ruleAndBody[0] as string;
    let rulesWithoutSplit = ruleAndBody[1] as string;
    rulesWithoutSplit = rulesWithoutSplit.replace(/\s+/g, '');
    let rules = rulesWithoutSplit.split("),")
    let body :any = [];
    rules.forEach((rule:string)=>{
        rule = rule.charAt(rule.length-1)==')'? rule : rule.concat(')');
        let predicate = parseFact(rule);
        body.push(predicate);
    })
    return miniProlog.buildClause(parseFact(name),...body);
}


export const readDatabase = () => {

    let database :any = [];
    let data = fs.readFileSync(DATABASE_PATH, 'ascii');

    let rules = data.split(".\r\n")
    rules.forEach(function (rule:string) {
        if(rule == ""){
            return;
        }
        if(!rule.match(':-')){
            database = [
                ...database,
                miniProlog.buildClause(parseFact(rule))
            ]
        } else{
            database = [
                ...database,
                parseRule(rule)
            ]
        }
    })
    return database;
}
