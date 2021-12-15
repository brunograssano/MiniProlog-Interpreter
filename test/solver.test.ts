import miniProlog from "../src/solver";

const relatives = [
    miniProlog.buildClause(
        miniProlog.buildPredicate('male', 'juan')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('male', 'pepe')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('male', 'hector')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('male', 'roberto')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('male', 'luis')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('male', 'alejandro')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('female', 'maria')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('female', 'cecilia')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('female', 'pepa')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('parent', 'juan', 'pepe')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('parent', 'juan', 'pepa')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('parent', 'hector', 'maria')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('parent', 'roberto', 'alejandro'),
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('parent', 'roberto', 'cecilia')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('parent', 'juan', 'roberto')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('parent', 'luis', 'juan')
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('son', 'X', 'Y'),
        miniProlog.buildPredicate('male', 'X'),
        miniProlog.buildPredicate('parent', 'Y', 'X'),
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('daughter', 'X', 'Y'),
        miniProlog.buildPredicate('female', 'X'),
        miniProlog.buildPredicate('parent', 'Y', 'X'),
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('grandparent', 'Grandparent', 'Grandchild'),
        miniProlog.buildPredicate('parent', 'Grandparent', 'Middle'),
        miniProlog.buildPredicate('parent', 'Middle', 'Grandchild'),
    ),
    miniProlog.buildClause(
        miniProlog.buildPredicate('great grandparent', 'GreatGrandparent', 'GreatGrandchild'),
        miniProlog.buildPredicate('grandparent', 'GreatGrandparent', 'Middle'),
        miniProlog.buildPredicate('parent', 'Middle', 'GreatGrandchild'),
    ),
];

describe('facts with relatives', function() {
    it('exact match male 1', () => {
        const query = miniProlog.buildPredicate('male', 'juan');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('exact match male 2', () => {
        const query = miniProlog.buildPredicate('male', 'hector');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('exact match male 3', () => {
        const query = miniProlog.buildPredicate('male', 'alejandro');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('exact match female 1', () => {
        const query = miniProlog.buildPredicate('female', 'maria');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('exact match female 2', () => {
        const query = miniProlog.buildPredicate('female', 'cecilia');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('if asked for male it returns false', () => {
        const query = miniProlog.buildPredicate('male', 'cecilia');
        expect(miniProlog.canProve(relatives, query)).toEqual(false);
    });
    it('if asked for female it returns false 1', () => {
        const query = miniProlog.buildPredicate('female', 'alejandro');
        expect(miniProlog.canProve(relatives, query)).toEqual(false);
    });
    it('if asked for female it returns false 2', () => {
        const query = miniProlog.buildPredicate('female', 'pepe');
        expect(miniProlog.canProve(relatives, query)).toEqual(false);
    });
    it('should return that he is the son', () => {
        const query = miniProlog.buildPredicate('son', 'pepe','juan');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('should return that he is not the daughter', () => {
        const query = miniProlog.buildPredicate('daughter', 'pepe','juan');
        expect(miniProlog.canProve(relatives, query)).toEqual(false);
    });
    it('should return that she is not the son', () => {
        const query = miniProlog.buildPredicate('son', 'maria','roberto');
        expect(miniProlog.canProve(relatives, query)).toEqual(false);
    });
    it('should return that she is the daughter', () => {
        const query = miniProlog.buildPredicate('daughter', 'maria','hector');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('should return that she is not the daughter of roberto', () => {
        const query = miniProlog.buildPredicate('daughter', 'maria','roberto');
        expect(miniProlog.canProve(relatives, query)).toEqual(false);
    });
});

describe('variables with relatives', function() {
    it('should return that there is a male', () => {
        const query = miniProlog.buildPredicate('male', 'X');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('should return that there is a female', () => {
        const query = miniProlog.buildPredicate('female', 'X');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('should return that there is a son from roberto', () => {
        const query = miniProlog.buildPredicate('son', 'X','roberto');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('should return that there is no son from alejandro', () => {
        const query = miniProlog.buildPredicate('son', 'X','alejandro');
        expect(miniProlog.canProve(relatives, query)).toEqual(false);
    });
    it('should return that there is no daughter from cecilia', () => {
        const query = miniProlog.buildPredicate('daughter', 'X','cecilia');
        expect(miniProlog.canProve(relatives, query)).toEqual(false);
    });
    it('should return that roberto has a daughter', () => {
        const query = miniProlog.buildPredicate('daughter', 'X','roberto');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('should return that there is a son', () => {
        const query = miniProlog.buildPredicate('son', 'X','Y');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('should return that there is a daughter', () => {
        const query = miniProlog.buildPredicate('daughter', 'X','Y');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('should return that there is a great grandparent from luis to cecilia', () => {
        const query = miniProlog.buildPredicate('great grandparent', 'luis','cecilia');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });
    it('should return that there is no great grandparent from luis to hector', () => {
        const query = miniProlog.buildPredicate('great grandparent', 'luis','hector');
        expect(miniProlog.canProve(relatives, query)).toEqual(false);
    });
    it('should return that there is a great grandparent to alejandro', () => {
        const query = miniProlog.buildPredicate('great grandparent', 'X','alejandro');
        expect(miniProlog.canProve(relatives, query)).toEqual(true);
    });

});
