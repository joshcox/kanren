import Variable from "./Variable";
import State from "./State";

const call = g => g(new State());

const fresh = f => f(new Variable());

const conj = (g1, g2) => state => g1(state).reduce(($, s) => [...$, ...g2(s)], []);

const disj = (g1, g2) => state => [...g1(state), ...g2(state)];

const unify = (u, v) => state => {
    const newState = state.unify(u, v);
    return newState ? [newState] : [];
};

export {
    call,
    fresh,
    conj,
    disj,
    State,
    unify,
    Variable
}