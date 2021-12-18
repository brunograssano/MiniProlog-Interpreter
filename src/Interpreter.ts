import miniProlog from "../src/solver";
import {parseInput, readDatabase, validInput} from "./DatabaseLoader";

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function InputMessage(database: any) {
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
            console.log(miniProlog.canProve(database, query))
        }
        InputMessage(database)
    });
}

function repl() {
    let database = readDatabase()
    InputMessage(database)
}

repl()