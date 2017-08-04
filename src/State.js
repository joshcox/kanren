import Variable from "./Variable";

export default class State {
    constructor(store = []) {
        this.store = store;

        // make sure it's immutable
        Object.freeze(this);
    }

    static copy(state) {
        return new State(state.store);
    }

    extend(left, right) {
        return new State([{ left, right }, ...this.store]);
    }

    unify(u, v) {
        u = this._walk(u);
        v = this._walk(v);

        if (u === v) return State.copy(this);
        if (Variable.isVariable(u)) return this.extend(u, v);
        if (Variable.isVariable(v)) return this.extend(v, u);
        if (Array.isArray(u) && Array.isArray(v)) {
            const [firstU, ...restU] = u;
            const [firstV, ...restV] = v;
            const newState = this.unify(firstU, firstV);
            return newState && newState.unify(restU, restV);
        }
        return false;
    }

    _walk(left) {
        const match = Variable.isVariable(left)
            && this.store.find(item => item.left === left);
        return match ? this._walk(match.right) : left;
    }
}