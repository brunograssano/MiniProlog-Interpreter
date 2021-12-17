import {parseInput, validInput} from "../src/DatabaseLoader";


describe('parse input', function() {
    it('proper input with 2 args', () => {
        let query = parseInput("parent(juan,david)")
        expect(query.name).toEqual("parent");
        expect(query.arguments.length).toEqual(2);
        expect(query.arguments[0]).toEqual("juan");
        expect(query.arguments[1]).toEqual("david");
    });

    it('proper input with 1 arg', () => {
        let query = parseInput("male(juan)")
        expect(query.name).toEqual("male");
        expect(query.arguments.length).toEqual(1);
        expect(query.arguments[0]).toEqual("juan");
    });

    it('proper input with 3 args', () => {
        let query = parseInput("and(  true,   true  , true )")
        expect(query.name).toEqual("and");
        expect(query.arguments.length).toEqual(3);
        expect(query.arguments[0]).toEqual("true");
        expect(query.arguments[1]).toEqual("true");
        expect(query.arguments[2]).toEqual("true");
    });

    it('wrong input, does not end with )', () => {
        expect(validInput("parent(juan,david")).toEqual(false);
    });

    it('wrong input, ends with extra )', () => {
        expect(validInput("parent(juan,david))")).toEqual(false);
    });

    it('wrong input, does not have arguments )', () => {
        expect(validInput("parent())")).toEqual(false);
    });

    it('wrong input, does not have arguments between ,', () => {
        expect(validInput("parent(,))")).toEqual(false);
    });

    it('wrong input, does not have arguments between arg,', () => {
        expect(validInput("parent(arg,))")).toEqual(false);
    });

    it('wrong input, does not have (', () => {
        expect(validInput("parent juan,david)")).toEqual(false);
    });

    it('wrong input, does not have a name', () => {
        expect(validInput("(juan,david)")).toEqual(false);
    });

    it('valid input with 3 args', () => {
        expect(validInput("and(  true,   true  , true )")).toEqual(true);
    });

    it('valid input with 2 args', () => {
        expect(validInput("and(  true,   true)")).toEqual(true);
    });

    it('valid input with 1 args', () => {
        expect(validInput("male( david )")).toEqual(true);
    });

});