export default class Variable {
    static isVariable(value) {
        return value instanceof Variable;
    }
}