let n = 0;

export default class Variable {
    constructor() {
        this._n = n++;
    }

    static isVariable(value) {
        return value instanceof Variable;
    }
}