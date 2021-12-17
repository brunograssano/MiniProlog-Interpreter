import miniProlog from "../src/solver";

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


function parseInput(input :string)  {
    let result = input.split('(');
    let name = result[0] as string;
    let argsWithoutSplit = result[1] as string;
    argsWithoutSplit = argsWithoutSplit.slice(0,argsWithoutSplit.length-1).replace(/\s+/g, '');
    let queryArguments = argsWithoutSplit.split(',');
    return miniProlog.buildPredicate(name,...queryArguments)
}

function validInput(input: string) {
    let firstPart = input.split('(');
    let name = firstPart[0] as string;
    let argsWithoutSplit = firstPart[1] as string;
    argsWithoutSplit = argsWithoutSplit.slice(0,argsWithoutSplit.length-1).replace(/\s+/g, '');
    let queryArguments = argsWithoutSplit.split(',');

    if (firstPart.length != 2 || input.charAt(0) == '('){
        return false;
    }
    if (argsWithoutSplit.split(')').length > 2 || input.charAt(input.length-1) != ')'){
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

function InputMessage() {
    console.log("======================================")
    console.log("Please input your query:")
    console.log("Examples:")
    console.log("* parent(alice, dave)")
    console.log("* parent(alice, X)")
    console.log("* parent(X, Y)")
    console.log("* exit to end the interpreter")
    rl.question("Input:",function (input:string) {
        if (input == 'exit'){
            rl.close()
            process.exit()
        }
        if(!validInput(input)){
            console.log("Please input a valid query");
        } else {
            let query = parseInput(input);
            console.log(miniProlog.canProve([], query))
        }
        InputMessage()
    });
}

function repl() {

    InputMessage()

}

repl()